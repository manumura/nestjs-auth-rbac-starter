import { Module } from '@nestjs/common';
import cloudinary from 'cloudinary';
import { WinstonModule } from 'nest-winston';
import { AuthenticationModule } from './authentication/authentication.module.js';
import { cloudinaryConfig } from './config/cloudinary.config.js';
import { loggerOptions } from './config/logger.config.js';
import { NotificationModule } from './notification/notification.module.js';
import { StorageModule } from './storage/storage.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [WinstonModule.forRoot(loggerOptions), UserModule, AuthenticationModule, NotificationModule, StorageModule],
})
export class AppModule {
  constructor() {
    cloudinary.v2.config(cloudinaryConfig);
  }
}
