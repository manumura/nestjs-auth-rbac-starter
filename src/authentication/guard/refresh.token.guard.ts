import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { appConstants } from '../../app.constants';
import { RefreshTokenException } from '../../shared/exception/refresh-token.exception';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import extractToken from '../strategy/token.utils';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  private logger = new Logger('RefreshTokenGuard');

  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const cookies = request.cookies;
    const token = extractToken(cookies, headers, appConstants.REFRESH_TOKEN);

    if (!token) {
      this.logger.error('Refresh token not found');
      throw new RefreshTokenException();
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByRefreshToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Authentication not found in DB with refresh token: ${token}`);
      throw new RefreshTokenException();
    }

    // Check validity of token
    const now = moment().utc();
    const expiredAt = moment(authTokenEntity.refreshTokenExpireAt).utc();
    if (expiredAt.isBefore(now)) {
      this.logger.error('Refresh token is expired');
      throw new RefreshTokenException();
    }

    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found from refresh token');
      throw new RefreshTokenException();
    }
    const user = this.userMapper.entityToAuthenticatedUserModel(userEntity);
    this.logger.debug(`User found from refresh token: ${JSON.stringify(user)}`);

    request.user = user;
    return true;
  }
}
