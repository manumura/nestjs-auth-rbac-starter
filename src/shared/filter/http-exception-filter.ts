import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { RefreshTokenException } from '../exception/refresh-token.exception';
import { clearAuthCookies } from '../util/cookies';

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
      clearAuthCookies(response);
    }

    logger.error(`Uncaught exception ${status} ${request.url}`, exception.stack);
    response.status(status).send(exception.getResponse());
  }
}
