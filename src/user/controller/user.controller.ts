import {
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
  Sse,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { Observable } from 'rxjs';
import { RolesGuard } from '../../authentication/guard/roles.guard';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { Roles } from '../../shared/decorator/roles.decorator';
import { PageModel } from '../../shared/model/page.model';
import { CreateUserDto } from '../dto/create.user.dto';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';
import { Role } from '../model/role.model';
import { UserChangeEvent } from '../model/user.change.event';
import { UserModel } from '../model/user.model';
import { UserPageModel } from '../model/user.page.model';
import { UserService } from '../service/user.service';

@Controller()
export class UserController {
  private logger = new Logger('UserController');

  constructor(private readonly userService: UserService) {}

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
    return this.userService.createUser(userData, currentUser);
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
    return this.userService.updateUserByUuid(uuid, updateUserDto, currentUser);
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
    return this.userService.deleteById(uuid, currentUser);
  }

  @Sse('/v1/events/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: Observable<UserChangeEvent> })
  streamUserChangeEvents(): Observable<UserChangeEvent | null> {
    // this.logger.log('Subscribe to user change events');
    return this.userService.userChangeEvent$;
  }
}
