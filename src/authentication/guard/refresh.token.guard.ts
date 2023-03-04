import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import moment from 'moment';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';

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

    if (!headers || !headers.authorization) {
      this.logger.error('No authorization header found');
      throw new UnauthorizedException();
    }

    const authorizationHeader = headers.authorization as string;
    if (!authorizationHeader.toLowerCase().includes('bearer')) {
      this.logger.error('No bearer header found');
      throw new UnauthorizedException();
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      this.logger.error('Token not found');
      throw new UnauthorizedException();
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByRefreshToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Refresh token not found for token: ${token}`);
      throw new UnauthorizedException();
    }

    // Check validity of token
    const now = moment().utc();
    const expiredAt = moment(authTokenEntity.refreshTokenExpireAt).utc();
    if (expiredAt.isBefore(now)) {
      this.logger.error('Refresh token is expired');
      throw new UnauthorizedException();
    }

    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found from refresh token');
      throw new UnauthorizedException();
    }
    const user = this.userMapper.entityToModel(userEntity);
    this.logger.debug(`User found from refresh token: ${JSON.stringify(user)}`);

    request.user = user;
    return true;
  }
}
