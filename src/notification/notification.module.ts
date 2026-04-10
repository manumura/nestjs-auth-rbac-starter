import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { mailerOptions } from '../config/mailer.config.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [MailerModule.forRoot(mailerOptions)],
  providers: [PrismaService, EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
