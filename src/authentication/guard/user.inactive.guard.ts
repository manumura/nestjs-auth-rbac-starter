import { CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { UserModel } from '../../user/model/user.model';

@Injectable()
export class UserInactiveGuard implements CanActivate {
  private logger = new Logger('UserActiveGuard');

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserModel;
    this.logger.debug(`User logged in: ${JSON.stringify(user)}`);

    const canActivate = user && !user.isActive;

    if (!canActivate) {
      this.logger.error('User is already active');
      throw new ForbiddenException('User is already active');
    }

    return true;
  }
}
