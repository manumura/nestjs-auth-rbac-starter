import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notification/email.service';
import { UserMapper } from '../user/mapper/user.mapper';
import { RoleRepository } from '../user/repository/role.repository';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from '../user/service/user.service';
import { AuthenticationController } from './controller/authentication.controller';
import { IndexController } from './controller/index.controller';
import { ResetPasswordController } from './controller/reset.password.controller';
import { ResetPasswordTokenMapper } from './mapper/reset.password.token.mapper';
import { AuthenticationTokenRepository } from './repository/authentication.token.repository';
import { ResetPasswordTokenRepository } from './repository/reset.password.token.repository';
import { AuthenticationService } from './service/authentication.service';
import { ResetPasswordService } from './service/reset.password.service';
import { CustomStrategy } from './strategy/custom.strategy';
import { IsResetPasswordTokenValidConstraint } from './validation/IsResetPasswordTokenValid';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'custom' }),
  ],
  controllers: [IndexController, AuthenticationController, ResetPasswordController],
  providers: [
    PrismaService,
    AuthenticationService,
    ResetPasswordService,
    UserService,
    EmailService,
    ResetPasswordTokenMapper,
    UserMapper,
    IsResetPasswordTokenValidConstraint,
    CustomStrategy,
    // https://docs.nestjs.com/fundamentals/custom-providers
    UserRepository,
    RoleRepository,
    ResetPasswordTokenRepository,
    AuthenticationTokenRepository,
  ],
  exports: [CustomStrategy, PassportModule],
})
export class AuthenticationModule {}
