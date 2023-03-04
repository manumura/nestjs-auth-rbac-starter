import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AuthenticationModule } from './authentication/authentication.module';
import { loggerOptions } from './config/logger.config';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    WinstonModule.forRoot(loggerOptions),
    UserModule,
    AuthenticationModule,
    NotificationModule,
  ],
})
export class AppModule {}
