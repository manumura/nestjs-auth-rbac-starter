import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { appConfig } from '../../config/config';

@Controller()
export class IndexController {
  private logger = new Logger('IndexController');

  @Get('/index')
  welcome(@Req() req: Request): string {
    const userAgent = req.headers['user-agent'];
    this.logger.verbose(`User agent detected: ${userAgent}`);
    if (!userAgent) {
      return `Welcome to NestJS starter ${appConfig.NODE_ENV}^^`;
    }
    return `Welcome to NestJS starter ${appConfig.NODE_ENV}^^ ${userAgent}`;
  }

  @Get('/v1/redirect')
  redirect(@Query('url') url: string, @Res() res: Response): void {
    this.logger.verbose(`Redirect to URL: ${url}`);
    return res.status(302).redirect(url);
  }
}
