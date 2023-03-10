import { Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { appConstants } from '../../app.constants';

const extractToken = (cookies: any, headers: IncomingHttpHeaders): string | undefined => {
  const logger = new Logger('extractToken');
  let token: string | undefined = undefined;

  if (cookies && cookies[appConstants.ACCESS_TOKEN_NAME]) {
    // Check token in cookies first
    logger.debug('Checking token in cookies');
    token = cookies[appConstants.ACCESS_TOKEN_NAME];
  } else if (headers && headers.authorization) {
    // Check token in headers
    logger.debug('Checking token in authorization header');
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader.toLowerCase().includes('bearer')) {
      logger.error('Bearer token authorization header not found');
    }

    token = authorizationHeader.split(' ')[1];
  }

  logger.debug(`Access token found: ${token}`);
  return token;
};

export default extractToken;
