import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notification/email.service';
import { ProfileController } from './controller/profile.controller';
import { UserController } from './controller/user.controller';
import { UserMapper } from './mapper/user.mapper';
import { RoleRepository } from './repository/role.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
import { IsEmailExistConstraint } from './validation/IsEmailExist';
import { IsUserEmailAlreadyExistConstraint } from './validation/IsUserEmailAlreadyExist';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'custom' }),
  ],
  controllers: [UserController, ProfileController,],
  providers: [
    PrismaService,
    UserService,
    EmailService,
    UserMapper,
    IsEmailExistConstraint,
    IsUserEmailAlreadyExistConstraint,
    UserRepository,
    RoleRepository,
  ],
})
export class UserModule {}
