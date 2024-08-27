import { Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';

const extractToken = (cookies: any, headers: IncomingHttpHeaders, cookieName: string): string | undefined => {
  const logger = new Logger('extractToken');
  let token: string | undefined = undefined;

  if (cookies && cookies[cookieName]) {
    // Check token in cookies first
    logger.debug(`Checking token in cookies for ${cookieName}`);
    token = cookies[cookieName];
  } else if (headers && headers.authorization) {
    // Check token in headers
    logger.debug('Checking token in authorization header');
    const authorizationHeader = headers.authorization;
    if (authorizationHeader.toLowerCase().includes('bearer')) {
      logger.debug('Bearer token authorization header found');
      token = authorizationHeader.split(' ')[1];
    }
  }

  logger.debug(`Token found for ${cookieName}: ${token}`);
  return token;
};

export default extractToken;
