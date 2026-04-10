import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../notification/email.service.js';
import { StorageService } from '../storage/storage.service.js';
import { ProfileController } from './controller/profile.controller.js';
import { UserController } from './controller/user.controller.js';
import { UserMapper } from './mapper/user.mapper.js';
import { RoleRepository } from './repository/role.repository.js';
import { UserRepository } from './repository/user.repository.js';
import { UserBulkService } from './service/user.bulk.service.js';
import { UserService } from './service/user.service.js';
import { IsUserEmailAlreadyExistConstraint } from './validation/IsUserEmailAlreadyExist.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'custom' })],
  controllers: [UserController, ProfileController],
  providers: [
    PrismaService,
    UserService,
    UserBulkService,
    EmailService,
    StorageService,
    UserMapper,
    IsUserEmailAlreadyExistConstraint,
    UserRepository,
    RoleRepository,
  ],
})
export class UserModule {}
