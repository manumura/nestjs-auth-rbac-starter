import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { appConstants } from '../../app.constants';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';
import extractToken from '../strategy/token.utils';

@Injectable()
export class LogoutGuard implements CanActivate {
  private logger = new Logger('LogoutGuard');

  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const cookies = request.cookies;
    const token = extractToken(cookies, headers, appConstants.ACCESS_TOKEN);

    if (!token) {
      this.logger.error('Access token not found');
      throw new UnauthorizedException();
    }

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      this.logger.error(`Authentication not found in DB with access token: ${token}`);
      throw new UnauthorizedException();
    }

    // No need to check validity of token
    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found from access token');
      throw new UnauthorizedException();
    }
    const user = this.userMapper.entityToAuthenticatedUserModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    request.user = user;
    return true;
  }
}
