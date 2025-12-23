import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { appConfig } from '../config/app.config';
import { EmailService } from '../notification/email.service';
import { StorageService } from '../storage/storage.service';
import { UserMapper } from '../user/mapper/user.mapper';
import { OauthProviderRepository } from '../user/repository/oauth-provider.repository';
import { RoleRepository } from '../user/repository/role.repository';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from '../user/service/user.service';
import { AuthenticationController } from './controller/authentication.controller';
import { CaptchaController } from './controller/captcha.controller';
import { IndexController } from './controller/index.controller';
import { ResetPasswordController } from './controller/reset.password.controller';
import { VerifyEmailController } from './controller/verify.email.controller';
import { ResetPasswordTokenMapper } from './mapper/reset.password.token.mapper';
import { AuthenticationTokenRepository } from './repository/authentication.token.repository';
import { ResetPasswordTokenRepository } from './repository/reset.password.token.repository';
import { VerifyEmailTokenRepository } from './repository/verify.email.token.repository';
import { AuthenticationService } from './service/authentication.service';
import { ResetPasswordService } from './service/reset.password.service';
import { VerifyEmailService } from './service/verify.email.service';
import { CustomAuthenticationStrategy } from './strategy/custom.authentication.strategy';
import { IsResetPasswordTokenValidConstraint } from './validation/IsResetPasswordTokenValid';
import { IsVerifyEmailTokenValidConstraint } from './validation/IsVerifyEmailTokenValid';

@Module({
  imports: [
    JwtModule.register({
      // https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9
      privateKey: appConfig.ID_TOKEN_PRIVATE_KEY,
      // publicKey: appConfig.ID_TOKEN_PUBLIC_KEY,
      signOptions: {
        algorithm: 'RS256',
        issuer: 'myapp',
      },
    }),
    PassportModule.register({ defaultStrategy: 'custom' }),
  ],
  controllers: [
    IndexController,
    AuthenticationController,
    ResetPasswordController,
    VerifyEmailController,
    CaptchaController,
  ],
  providers: [
    PrismaService,
    AuthenticationService,
    ResetPasswordService,
    VerifyEmailService,
    UserService,
    EmailService,
    StorageService,
    ResetPasswordTokenMapper,
    UserMapper,
    IsResetPasswordTokenValidConstraint,
    IsVerifyEmailTokenValidConstraint,
    CustomAuthenticationStrategy,
    // https://docs.nestjs.com/fundamentals/custom-providers
    UserRepository,
    RoleRepository,
    OauthProviderRepository,
    ResetPasswordTokenRepository,
    VerifyEmailTokenRepository,
    AuthenticationTokenRepository,
  ],
  exports: [CustomAuthenticationStrategy, PassportModule],
})
export class AuthenticationModule {}
