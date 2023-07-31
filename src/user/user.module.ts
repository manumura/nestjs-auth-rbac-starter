import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notification/email.service';
import { StorageService } from '../storage/storage.service';
import { ProfileController } from './controller/profile.controller';
import { UserController } from './controller/user.controller';
import { UserMapper } from './mapper/user.mapper';
import { RoleRepository } from './repository/role.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';
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
    StorageService,
    UserMapper,
    IsUserEmailAlreadyExistConstraint,
    UserRepository,
    RoleRepository,
  ],
})
export class UserModule {}
