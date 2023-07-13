import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import moment from 'moment';
import { Strategy } from 'passport-strategy';
import { appConstants } from '../../app.constants';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import extractToken from './token.utils';
import { UserModel } from '../../user/model/user.model';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  private logger = new Logger('CustomStrategy');

  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
  ) {
    super();
  }

  async authenticate(request: Request): Promise<UserModel> {
    const headers = request.headers;
    const cookies = request.cookies;
    const token = extractToken(cookies, headers, appConstants.ACCESS_TOKEN);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      throw new UnauthorizedException(`Authentication not found in DB with access token: ${token}`);
    }

    // Check validity of token
    const now = moment().utc();
    const expiredAt = moment(authTokenEntity.accessTokenExpireAt).utc();
    if (expiredAt.isBefore(now)) {
      throw new UnauthorizedException('Access token is expired');
    }

    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      throw new UnauthorizedException('User not found with access token');
    }
    const user = this.userMapper.entityToModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    return user;
  }
}
