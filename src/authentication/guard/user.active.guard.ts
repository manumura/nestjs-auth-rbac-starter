import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthenticatedUserModel } from '../../user/model/authenticated.user.model';

@Injectable()
export class UserActiveGuard implements CanActivate {
  private readonly logger = new Logger('UserActiveGuard');

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUserModel;
    this.logger.debug(`User logged in: ${JSON.stringify(user)}`);

    const canActivate = user?.isActive;

    if (!canActivate) {
      this.logger.error('User must be active');
      throw new ForbiddenException('User must be active');
    }

    return true;
  }
}
