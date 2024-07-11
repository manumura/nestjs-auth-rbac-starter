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
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from '../config/config';
import { StorageService } from '../storage/storage.service';
import { CaptchaController } from './controller/captcha.controller';

@Module({
  imports: [
    JwtModule.register({
      // https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9
      privateKey: appConfig.ID_TOKEN_PRIVATE_KEY, 
      // publicKey: appConfig.ID_TOKEN_PUBLIC_KEY,
      signOptions: {
      algorithm: 'RS256',
      issuer: 'myapp',
    } }),
    PassportModule.register({ defaultStrategy: 'custom' }),
  ],
  controllers: [IndexController, AuthenticationController, ResetPasswordController, CaptchaController],
  providers: [
    PrismaService,
    AuthenticationService,
    ResetPasswordService,
    UserService,
    EmailService,
    StorageService,
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
