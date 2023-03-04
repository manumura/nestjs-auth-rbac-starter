import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { mailerOptions } from '../config/mailer.config';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot(mailerOptions),
  ],
  providers: [
    PrismaService,
    EmailService,
  ],
  exports: [EmailService],
})
export class NotificationModule {}
