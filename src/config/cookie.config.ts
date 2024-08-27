import type { CookieSerializeOptions } from '@fastify/cookie';
import { appConfig } from './config';

const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export const COOKIE_OPTIONS: CookieSerializeOptions = {
  maxAge: COOKIE_MAX_AGE,
  expires: new Date(Date.now() + COOKIE_MAX_AGE * 1000),
  httpOnly: true,
  secure: appConfig.NODE_ENV === 'prod',
  domain: appConfig.DOMAIN,
  path: '/',
  sameSite: 'lax',
};
