import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../user/model/role.model';
import { UserModel } from '../../user/model/user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger('RolesGuard');

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserModel;
    this.logger.debug(`User logged in: ${JSON.stringify(user)}`);

    if (!user || !user.role) {
      this.logger.error('User or role undefined');
      throw new ForbiddenException('User or role undefined');
    }

    const hasRole = () => roles.some((role) => user.role === role);
    const canActivate = user && user.role && hasRole();

    if (!canActivate) {
      this.logger.error(`User with role ${user.role} forbidden to access this resource`);
      throw new ForbiddenException(`User with role ${user.role} forbidden to access this resource`);
    }

    return true;
  }
}
