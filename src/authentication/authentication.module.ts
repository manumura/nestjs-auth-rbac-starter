import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service.js';
import { appConfig } from '../config/app.config.js';
import { EmailService } from '../notification/email.service.js';
import { StorageService } from '../storage/storage.service.js';
import { UserMapper } from '../user/mapper/user.mapper.js';
import { OauthProviderRepository } from '../user/repository/oauth-provider.repository.js';
import { RoleRepository } from '../user/repository/role.repository.js';
import { UserRepository } from '../user/repository/user.repository.js';
import { UserService } from '../user/service/user.service.js';
import { AuthenticationController } from './controller/authentication.controller.js';
import { CaptchaController } from './controller/captcha.controller.js';
import { IndexController } from './controller/index.controller.js';
import { ResetPasswordController } from './controller/reset.password.controller.js';
import { VerifyEmailController } from './controller/verify.email.controller.js';
import { ResetPasswordTokenMapper } from './mapper/reset.password.token.mapper.js';
import { AuthenticationTokenRepository } from './repository/authentication.token.repository.js';
import { ResetPasswordTokenRepository } from './repository/reset.password.token.repository.js';
import { VerifyEmailTokenRepository } from './repository/verify.email.token.repository.js';
import { AuthenticationService } from './service/authentication.service.js';
import { ResetPasswordService } from './service/reset.password.service.js';
import { VerifyEmailService } from './service/verify.email.service.js';
import { CustomAuthenticationStrategy } from './strategy/custom.authentication.strategy.js';
import { IsResetPasswordTokenValidConstraint } from './validation/IsResetPasswordTokenValid.js';
import { IsVerifyEmailTokenValidConstraint } from './validation/IsVerifyEmailTokenValid.js';

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
