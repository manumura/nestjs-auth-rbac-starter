import { Body, Controller, HttpCode, Logger, Post, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserModel } from '../../user/model/user.model.js';
import { VerifyEmailDto } from '../dto/verify.email.dto.js';
import { VerifyEmailService } from '../service/verify.email.service.js';

@Controller()
export class VerifyEmailController {
  private readonly logger = new Logger('VerifyEmailController');

  constructor(private readonly verifyEmailService: VerifyEmailService) {}

  @Post('/v1/verify-email')
  @HttpCode(200)
  @ApiOkResponse({ type: UserModel })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  resetPassword(@Body(ValidationPipe) verifyEmailDto: VerifyEmailDto): Promise<UserModel> {
    this.logger.log(`Verify email for user with token ${verifyEmailDto.token}`);
    return this.verifyEmailService.verifyEmail(verifyEmailDto);
  }
}
