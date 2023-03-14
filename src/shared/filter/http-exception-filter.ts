import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { appConstants } from '../../app.constants';
import { COOKIE_OPTIONS } from '../../config/cookie.config';
import { FastifyReply } from 'fastify';
import { RefreshTokenException } from '../exception/refresh-token.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const logger = new Logger('HttpExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    // Delete cookies if refresh token API returns exception
    if (exception.name === RefreshTokenException.name) {
      this.clearAuthCookies(response);
    }

    logger.error(`Uncaught exception ${status} ${request.url}`, exception.stack);
    response.status(status).send(exception.getResponse());
  }

  private clearAuthCookies(response: FastifyReply) {
    response.clearCookie(appConstants.ACCESS_TOKEN_NAME, COOKIE_OPTIONS);
    response.clearCookie(appConstants.REFRESH_TOKEN_NAME, COOKIE_OPTIONS);
  }
}
