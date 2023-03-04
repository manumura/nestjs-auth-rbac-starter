import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/model/role.model';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
