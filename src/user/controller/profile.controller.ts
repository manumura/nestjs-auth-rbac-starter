import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
import { ApiFile } from '../../shared/decorator/ApiFile.decorator';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UserMapper } from '../mapper/user.mapper';
import { AuthenticatedUserModel } from '../model/authenticated.user.model';
import { UserModel } from '../model/user.model';
import { UserService } from '../service/user.service';

@Controller()
export class ProfileController {
  private logger = new Logger('ProfileController');

  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get('/v1/profile')
  @UseGuards(AuthGuard(), UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  getProfile(@GetUser() currentUser: AuthenticatedUserModel): Promise<UserModel> {
    this.logger.log(`Get profile for user ${currentUser.uuid}`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }
    return this.userService.findByUuid(currentUser.uuid);
  }

  @Put('/v1/profile')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  updateProfile(
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Update profile for user ${currentUser.uuid}`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }
    return this.userService.updateProfileByUserUuid(currentUser.uuid, updateProfileDto);
  }

  @Put('/v1/profile/password')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  updatePassword(
    @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Update password for user ${currentUser.uuid}`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }
    return this.userService.updatePasswordByUserUuid(currentUser.uuid, updatePasswordDto);
  }

  @Put('/v1/profile/image')
  @UseGuards(AuthGuard())
  @ApiConsumes('multipart/form-data')
  @ApiFile('image')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async updateProfileImage(
    @Req() req: FastifyRequest,
    @GetUser() currentUser: AuthenticatedUserModel,
  ): Promise<UserModel> {
    this.logger.log(`Update profile image for user ${currentUser.uuid}`);
    if (!currentUser?.uuid) {
      throw new BadRequestException('User UUID is required');
    }

    const isMultipart = req.isMultipart();
    if (!isMultipart) {
      throw new BadRequestException('multipart/form-data expected.');
    }

    const file = await req.file();
    if (!file) {
      throw new BadRequestException('File not found');
    }

    return this.userService.updateImageByUserUuid(currentUser.uuid, file);
  }
}
