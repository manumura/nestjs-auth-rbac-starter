import { Body, Controller, HttpCode, Logger, Post, ValidationPipe } from '@nestjs/common';
import { RecaptchaDto } from '../dto/recaptach.dto.js';
import { appConfig } from '../../config/app.config.js';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import ky from 'ky';

@Controller()
export class CaptchaController {
  private readonly logger = new Logger('CaptchaController');

  @Post('/v1/recaptcha')
  @HttpCode(200)
  @ApiOkResponse({ type: 'boolean' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async validateCaptcha(@Body(ValidationPipe) recaptchaDto: RecaptchaDto): Promise<boolean> {
    const { token } = recaptchaDto;
    this.logger.log(`Validate captcha with token ${token}`);
    if (!token) {
      this.logger.error('Token not found');
      return false;
    }

    const res = await ky
      .post('https://www.google.com/recaptcha/api/siteverify', {
        searchParams: { secret: appConfig.RECAPTCHA_SECRET_KEY, response: token },
      })
      .json<{ score: number }>();
    const score = res.score;
    this.logger.log(`Captcha score: ${score}`);
    return score > 0.5;
  }
}
