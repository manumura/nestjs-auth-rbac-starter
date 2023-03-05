import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import moment from 'moment';
import { Strategy } from 'passport-strategy';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';

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
    const headers = request.headers;

    if (!headers || !headers.authorization) {
      this.logger.error('Authorization header not found');
      return this.fail({ message: 'Authorization header not found' }, 401);
    }

    const authorizationHeader = headers.authorization;
    if (!authorizationHeader.toLowerCase().includes('bearer')) {
      this.logger.error('Bearer header not found');
      return this.fail({ message: 'Bearer header not found' }, 401);
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      this.logger.error('Token header not found');
      return this.fail({ message: 'Token header not found' }, 401);
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Access token not found: ${token}`);
      return this.fail({ message: 'Access token not found' }, 401);
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
    const user = this.userMapper.entityToModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    return this.success(user);
  }
}