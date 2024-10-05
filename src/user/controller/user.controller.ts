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
import { UUID } from 'crypto';
import csvParser from 'csv-parser';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { RolesGuard } from '../../authentication/guard/roles.guard';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
import { ApiFile } from '../../shared/decorator/ApiFile.decorator';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { Roles } from '../../shared/decorator/roles.decorator';
import { MessageModel } from '../../shared/model/message.model';
import { PageModel } from '../../shared/model/page.model';
import { StorageService } from '../../storage/storage.service';
import { CreateBulkUserDto } from '../dto/create.bulk.user.dto';
import { CreateUserDto } from '../dto/create.user.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';
import { Role } from '../model/role.model';
import { UserChangeEvent } from '../model/user.change.event';
import { UserModel } from '../model/user.model';
import { UserPageModel } from '../model/user.page.model';
import { UserBulkService } from '../service/user.bulk.service';
import { UserService } from '../service/user.service';

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
