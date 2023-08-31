import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import moment from 'moment';
import { Strategy } from 'passport-strategy';
import { appConstants } from '../../app.constants';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import extractToken from './token.utils';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  private logger = new Logger('CustomStrategy');

  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
  ) {
    super();
  }

  async authenticate(request: Request): Promise<void> {
    this.logger.log(`Checking authentication for request: ${request.url}`);
    const headers = request.headers;
    const cookies = request.cookies;
    const token = extractToken(cookies, headers, appConstants.ACCESS_TOKEN);

    if (!token) {
      this.logger.error('Access token not found');
      return this.fail({ message: 'Access token not found' }, 401);
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Authentication not found in DB with access token: ${token}`);
      return this.fail({ message: 'Authentication not found in DB with access token' }, 401);
    }

    // Check validity of token
    const now = moment().utc();
    const expiredAt = moment(authTokenEntity.accessTokenExpireAt).utc();
    if (expiredAt.isBefore(now)) {
      this.logger.error('Access token is expired');
      return this.fail({ message: 'Access token is expired' }, 401);
    }

    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found with access token');
      return this.fail({ message: 'User not found with access token' }, 401);
    }
    const user = this.userMapper.entityToAuthenticatedUserModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    return this.success(user);
  }
}
