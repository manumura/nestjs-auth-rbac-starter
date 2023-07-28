import { Body, Controller, Get, HttpCode, Logger, Param, Post, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { MessageModel } from '../../shared/model/message.model';
import { UserModel } from '../../user/model/user.model';
import { ForgotPasswordDto } from '../dto/forgot.password.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { ResetPasswordService } from '../service/reset.password.service';

@Controller()
export class ResetPasswordController {
  private logger = new Logger('ResetPasswordController');

  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('/v1/forgot-password')
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: MessageModel,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto): Promise<MessageModel> {
    this.logger.log(`Forgot password for user with email ${forgotPasswordDto.email}`);
    const resetPasswordTokenModel = await this.resetPasswordService.createToken(forgotPasswordDto);
    const message = resetPasswordTokenModel ? 'success' : 'failed';
    return {
      message,
    };
  }

  @Get('/v1/token/:token')
  @ApiOkResponse({ type: UserModel })
  findUserByToken(@Param('token') token: string): Promise<UserModel> {
    this.logger.log(`Get user with token ${token}`);
    return this.resetPasswordService.findByValidToken(token);
  }

  @Post('/v1/new-password')
  @HttpCode(200)
  @ApiOkResponse({ type: UserModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto): Promise<UserModel> {
    this.logger.log(`Reset password for user with token ${resetPasswordDto.token}`);
    return this.resetPasswordService.resetPassword(resetPasswordDto);
  }
}
