import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserMapper } from '../../user/mapper/user.mapper';
import { AuthenticationTokenRepository } from '../repository/authentication.token.repository';

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

    const authTokenEntity = await this.authenticationTokenRepository.findByAccessToken(token);
    if (!authTokenEntity) {
      this.logger.error('Access token not found');
      throw new UnauthorizedException();
    }

    // No need to check validity of token
    const userEntity = authTokenEntity.user;
    if (!userEntity) {
      this.logger.error('User not found from access token');
      throw new UnauthorizedException();
    }
    const user = this.userMapper.entityToModel(userEntity);
    this.logger.debug(`User found from access token: ${JSON.stringify(user)}`);

    request.user = user;
    return true;
  }
}
