import {
  Body,
  Controller,
  Delete,
  Get,
  Logger, Param,
  ParseIntPipe, Put,
  Query, UseGuards, ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth, ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { RolesGuard } from '../../authentication/guard/roles.guard';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
import { Roles } from '../../shared/decorator/roles.decorator';
import { PageModel } from '../../shared/model/page.model';
import { GetUsersDto } from '../dto/get.users.dto';
import { UpdateEmailDto } from '../dto/update.email.dto';
import { Role } from '../model/role.model';
import { UserModel } from '../model/user.model';
import { UserPageModel } from '../model/user.page.model';
import { UserService } from '../service/user.service';

@Controller()
export class UserController {
  private logger = new Logger('UserController');

  constructor(private readonly userService: UserService) {}

  @Get('/v1/users')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserPageModel })
  findUsers(@Query(ValidationPipe) getUsersDto: GetUsersDto): Promise<PageModel<UserModel>> {
    return this.userService.findAll(getUsersDto);
  }

  @Get('/v1/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  findUserById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.userService.findById(id);
  }

  @Put('/v1/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEmailDto: UpdateEmailDto,
  ): Promise<UserModel> {
    return this.userService.updateEmailById(id, updateEmailDto);
  }

  @Delete('/v1/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), UserActiveGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  deleteUserById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.userService.deleteById(id);
  }
}
