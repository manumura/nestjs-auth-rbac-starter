import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserModel } from '../../user/model/user.model';

export const GetUser = createParamDecorator(
  (data: any, ctx: ExecutionContext): UserModel => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
