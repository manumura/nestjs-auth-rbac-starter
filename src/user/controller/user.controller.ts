import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Sse,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { UUID } from 'node:crypto';
import csvParser from 'csv-parser';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { RolesGuard } from '../../authentication/guard/roles.guard.js';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard.js';
import { ApiFile } from '../../shared/decorator/ApiFile.decorator.js';
import { GetUser } from '../../shared/decorator/get-user.decorator.js';
import { Roles } from '../../shared/decorator/roles.decorator.js';
import { MessageModel } from '../../shared/model/message.model.js';
import { PageModel } from '../../shared/model/page.model.js';
import { StorageService } from '../../storage/storage.service.js';
import { CreateBulkUserDto } from '../dto/create.bulk.user.dto.js';
import { CreateUserDto } from '../dto/create.user.dto.js';
import { GetUsersDto } from '../dto/get.users.dto.js';
import { UpdateUserDto } from '../dto/update.user.dto.js';
import { AuthenticatedUserModel } from '../model/authenticated.user.model.js';
import { Role } from '../model/role.model.js';
import { UserChangeEvent } from '../model/user.change.event.js';
import { UserModel } from '../model/user.model.js';
import { UserPageModel } from '../model/user.page.model.js';
import { UserBulkService } from '../service/user.bulk.service.js';
import { UserService } from '../service/user.service.js';

@Controller()
export class UserController {
  private readonly logger = new Logger('UserController');

  constructor(
    private readonly userService: UserService,
    private readonly userBulkService: UserBulkService,
    private readonly storageService: StorageService,
  ) {}

  @Post('/v1/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: UserModel,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  createUser(
    @Body(ValidationPipe) userData: CreateUserDto,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Create user with email ${userData.email}`);
    return this.userService.createUser(userData, currentUser.uuid);
  }

  @Get('/v1/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserPageModel })
  findUsers(@Query(ValidationPipe) getUsersDto: GetUsersDto): Promise<PageModel<UserModel>> {
    this.logger.log(`Get users with filter ${JSON.stringify(getUsersDto)}`);
    return this.userService.findAll(getUsersDto);
  }

  @Get('/v1/users/:uuid')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  findUserByUuid(@Param('uuid', ParseUUIDPipe) uuid: UUID): Promise<UserModel> {
    this.logger.log(`Get user with UUID ${uuid}`);
    return this.userService.findByUuid(uuid);
  }

  @Put('/v1/users/:uuid')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  updateUserByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: UUID,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Update user with UUID ${uuid}`);
    return this.userService.updateByUuid(uuid, updateUserDto, currentUser.uuid);
  }

  @Delete('/v1/users/:uuid')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  deleteUserByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: UUID,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Delete user with UUID ${uuid}`);
    return this.userService.deleteByUuid(uuid, currentUser.uuid);
  }

  @Sse('/v1/events/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: Observable<UserChangeEvent> })
  streamUserChangeEvents(): Observable<UserChangeEvent | null> {
    return this.userService.userChangeEvent$;
  }

  @Post('/v1/bulk/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiFile('users')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiAcceptedResponse({
    description: 'File submitted succesfully, processing users asynchronously.',
    type: UserModel,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async batchRegistration(@Req() req: FastifyRequest) {
    const isMultipart = req.isMultipart();
    if (!isMultipart) {
      throw new BadRequestException('multipart/form-data expected.');
    }

    const file = await req.file();
    if (!file) {
      throw new BadRequestException('File not found');
    }
    const response = await this.storageService.saveCsvToLocalPath(file);
    if (!response) {
      throw new BadRequestException('Error while saving file');
    }

    const users: CreateUserDto[] = [];
    const transform = csvParser(['email', 'name']);

    const onData = async (data) => {
      const user: CreateBulkUserDto = {
        email: data['email'],
        name: data['name'],
        role: Role.USER,
      };
      users.push(user);
    };

    const onEnd = async () => {
      this.logger.verbose(`File processed successfully: ${response.filename}`);
      // Delete file uploaded
      this.storageService.deleteFromLocalPath(response.filepath);
      await this.userBulkService.bulkRegister(users);
    };

    this.storageService.readFile(response.filepath, transform, onData, onEnd);
    const message: MessageModel = {
      message: 'File submitted succesfully, processing users asynchronously',
    };
    return message;
  }
}
