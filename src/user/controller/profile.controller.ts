import { BadRequestException, Body, Controller, Get, Logger, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { UserActiveGuard } from '../../authentication/guard/user.active.guard';
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
}
