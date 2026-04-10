import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/model/role.model.js';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
