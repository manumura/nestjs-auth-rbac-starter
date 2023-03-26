import { FastifyReply } from 'fastify';
import { appConstants } from '../../app.constants';
import { LoginModel } from '../../authentication/model/login.model';
import { COOKIE_OPTIONS } from '../../config/cookie.config';

export const setAuthCookies = (response: FastifyReply, login: LoginModel) => {
  response.setCookie(appConstants.ACCESS_TOKEN, login.accessToken, COOKIE_OPTIONS);
  response.setCookie(appConstants.REFRESH_TOKEN, login.refreshToken, COOKIE_OPTIONS);
};

export const clearAuthCookies = (response: FastifyReply) => {
  response.clearCookie(appConstants.ACCESS_TOKEN, COOKIE_OPTIONS);
  response.clearCookie(appConstants.REFRESH_TOKEN, COOKIE_OPTIONS);
};
