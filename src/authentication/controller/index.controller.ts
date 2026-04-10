import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { RealIP } from 'nestjs-real-ip';
import { appConfig } from '../../config/app.config.js';

@Controller()
export class IndexController {
  private readonly logger = new Logger('IndexController');

  @Get('/v1/index')
  welcome() {
    this.logger.log('Index API');
    return {
      message: 'Welcome to NestJS starter ^^',
    };
  }

  @Get('/v1/info')
  info(@Req() req: FastifyRequest, @RealIP() ip: string) {
    const userAgent = req.headers['user-agent'];
    this.logger.log(`Info API, User agent detected: ${userAgent}, hostname: ${req.hostname}`);
    return {
      env: appConfig.NODE_ENV,
      userAgent: userAgent,
      ip,
      hostname: req.hostname,
    };
  }

  @Get('/v1/redirect')
  redirect(@Query('url') url: string, @Res() res: FastifyReply): void {
    this.logger.log(`Redirect to URL: ${url}`);
    res.status(302).redirect(url);
  }
}
