import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import moment from 'moment';
import { Strategy } from 'passport-custom';
import { appConstants } from '../../app.constants';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticatedUserModel } from '../../user/model/authenticated.user.model';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import extractToken from './token.utils';

@Injectable()
export class CustomAuthenticationStrategy extends PassportStrategy(Strategy, 'custom') {
  private readonly logger = new Logger('CustomAuthenticationStrategy');

  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
  ) {
    super();
  }

  async validate(request: Request): Promise<AuthenticatedUserModel> {
    this.logger.debug(`Checking authentication for request: ${request.url}`);
    const headers = request.headers;
    const cookies = request.cookies;
    const token = extractToken(cookies, headers, appConstants.ACCESS_TOKEN);

    if (!token) {
      this.logger.error('Access token not found');
      throw new UnauthorizedException('Unauthorized');
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Authentication not found in DB with access token: ${token}`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Check validity of token
    const now = moment().utc();
    const expiredAt = moment(authTokenEntity.accessTokenExpireAt).utc();
    if (expiredAt.isBefore(now)) {
      this.logger.error('Access token is expired');
      throw new UnauthorizedException('Unauthorized');
    }

    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found with access token');
      throw new UnauthorizedException('Unauthorized');
    }

    // Done in UserActiveGuard
    // if (!userEntity.isActive) {
    //   this.logger.error('User is not active');
    //   return this.fail({ message: 'User is not active' }, 401);
    // }

    const user = this.userMapper.entityToAuthenticatedUserModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    return user;
  }
}
