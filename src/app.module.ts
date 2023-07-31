import { Module } from '@nestjs/common';
import cloudinary from 'cloudinary';
import { WinstonModule } from 'nest-winston';
import { AuthenticationModule } from './authentication/authentication.module';
import { cloudinaryConfig } from './config/cloudinary.config';
import { loggerOptions } from './config/logger.config';
import { NotificationModule } from './notification/notification.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    WinstonModule.forRoot(loggerOptions),
    UserModule,
    AuthenticationModule,
    NotificationModule,
    StorageModule,
  ],
})
export class AppModule {
  constructor() {
    cloudinary.v2.config(cloudinaryConfig);
  }
}
