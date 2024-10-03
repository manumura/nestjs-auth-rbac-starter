import { Body, Controller, Logger, Post, ValidationPipe } from '@nestjs/common';
import { RecaptchaDto } from '../dto/recaptach.dto';
import axios from 'axios';
import { appConfig } from '../../config/config';

@Controller()
export class CaptchaController {
  private readonly logger = new Logger('CaptchaController');

  @Post('/v1/recaptcha')
  async validateCaptcha(@Body(ValidationPipe) recaptchaDto: RecaptchaDto): Promise<boolean> {
    const { token } = recaptchaDto;
    this.logger.log(`Validate captcha with token ${token}`);
    if (!token) {
      this.logger.error('Token not found');
      return false;
    }

    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${appConfig.RECAPTCHA_SECRET_KEY}&response=${token}`,
    );
    const score = res.data.score;
    this.logger.log(`Captcha score: ${score}`);
    return score > 0.5;
  }
}
