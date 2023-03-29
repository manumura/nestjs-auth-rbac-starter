import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { appConfig } from '../../config/config';

@Controller()
export class IndexController {
  private logger = new Logger('IndexController');

  @Get('/index')
  welcome(): string {
    this.logger.verbose('index api');
    return 'Welcome to NestJS starter ^^';
  }

  @Get('/v1/info')
  info(@Req() req: Request, @RealIP() ip: string) {
    const userAgent = req.headers['user-agent'];
    this.logger.verbose(`User agent detected: ${userAgent}`);
    return {
      env: appConfig.NODE_ENV,
      userAgent: userAgent,
      ip,
    };
  }

  @Get('/v1/redirect')
  redirect(@Query('url') url: string, @Res() res: Response): void {
    this.logger.verbose(`Redirect to URL: ${url}`);
    return res.status(302).redirect(url);
  }
}
