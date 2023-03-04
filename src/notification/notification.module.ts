import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { mailerOptions } from '../config/mailer.config';
import { UserRepository } from '../user/repository/user.repository';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot(mailerOptions),
  ],
  providers: [
    PrismaService,
    EmailService,
    UserRepository,
  ],
  exports: [EmailService],
})
export class NotificationModule {}
