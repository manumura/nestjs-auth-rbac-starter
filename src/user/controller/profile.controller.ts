import { BadRequestException, Body, Controller, Get, Logger, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiConsumes, ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
import { ApiFile } from '../../shared/decorator/ApiFile.decorator';
import { GetUser } from '../../shared/decorator/get-user.decorator';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { UserModel } from '../model/user.model';
import { UserService } from '../service/user.service';

@Controller()
export class ProfileController {
  private logger = new Logger('ProfileController');

  constructor(private readonly userService: UserService) {}

  @Get('/v1/profile')
  @UseGuards(AuthGuard(), UserActiveGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: UserModel })
  getProfile(@GetUser() user: UserModel): UserModel {
    this.logger.log(`Get profile for user with email ${user.email}`);
    return user;
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
    @GetUser() user: UserModel,
  ): Promise<UserModel> {
    this.logger.log(`Update profile for user with email ${user.email}`);
    if (!user.id) {
      throw new BadRequestException('User ID is required');
    }
    return this.userService.updateProfileById(user.id, updateProfileDto);
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
  async updateProfileImage(@Req() req: FastifyRequest, @GetUser() user: UserModel): Promise<UserModel> {
    this.logger.log(`Update profile image for user with email ${user.email}`);
    if (!user.id) {
      throw new BadRequestException('User ID is required');
    }

    const isMultipart = req.isMultipart();
    if (!isMultipart) {
      throw new BadRequestException('multipart/form-data expected.');
    }

    const file = await req.file();
    if (!file) {
      throw new BadRequestException('File not found');
    }

    return this.userService.updateImageById(user.id, file);
  }
}
