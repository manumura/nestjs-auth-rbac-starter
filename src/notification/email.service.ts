import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { appConstants } from '../app.constants';
import { appConfig } from '../config/app.config';
import { LanguageCode } from '../user/model/language-code.model';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');

  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(email: string, langCode: string, token: string): Promise<SentMessageInfo> {
    this.logger.verbose(`Send reset password email to: ${email}`);
    if (!email || !token) {
      throw new Error('Email or token undefined');
    }

    // Default lang code to english if not found
    if (!langCode) {
      langCode = LanguageCode.EN;
    }

    try {
      const url = appConfig.RESET_PASSWORD_LINK + token;
      const templateData = {
        resetPasswordLink: url,
      };

      const info = await this.mailerService.sendMail({
        to: email,
        subject: appConstants.RESET_PASSWORD_EMAIL_SUBJECT[langCode],
        template: `${appConstants.RESET_PASSWORD_EMAIL_TEMPLATE}-${langCode}`,
        context: templateData,
      });
      this.logger.verbose(`Response Send email: ${JSON.stringify(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${email}`, error.stack);
    }
  }

  async sendTemporaryPasswordEmail(email: string, langCode: string, password: string): Promise<SentMessageInfo> {
    this.logger.verbose(`Send temporary password email to: ${email}`);
    if (!email || !password) {
      throw new Error('Email or password undefined');
    }

    // Default lang code to english if not found
    if (!langCode) {
      langCode = LanguageCode.EN;
    }

    try {
      const templateData = {
        password,
      };

      const info = await this.mailerService.sendMail({
        to: email,
        subject: appConstants.TEMPORARY_PASSWORD_EMAIL_SUBJECT[langCode],
        template: `${appConstants.TEMPORARY_PASSWORD_EMAIL_TEMPLATE}-${langCode}`,
        context: templateData,
      });
      this.logger.verbose(`Response Send email: ${JSON.stringify(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send temporary password email to ${email}`, error.stack);
    }
  }

  async sendNewUserEmail(rootUserEmail: string, langCode: string, newUserEmail: string): Promise<SentMessageInfo> {
    this.logger.verbose(`Send new user email to: ${rootUserEmail}`);
    if (!rootUserEmail || !newUserEmail) {
      throw new Error('Root user email or new user email undefined');
    }

    // Default lang code to english if not found
    if (!langCode) {
      langCode = LanguageCode.EN;
    }

    try {
      const templateData = {
        newUserEmail,
      };

      const info = await this.mailerService.sendMail({
        to: rootUserEmail,
        subject: appConstants.NEW_USER_EMAIL_SUBJECT[langCode],
        template: `${appConstants.NEW_USER_EMAIL_TEMPLATE}-${langCode}`,
        context: templateData,
      });
      this.logger.verbose(`Response Send email: ${JSON.stringify(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send new user email to ${rootUserEmail}`, error.stack);
    }
  }

  async sendRegistrationEmail(email: string, langCode: string, token: string): Promise<SentMessageInfo> {
    this.logger.verbose(`Send registration email to: ${email}`);
    if (!email || !token) {
      throw new Error('Email or token undefined');
    }

    // Default lang code to english if not found
    if (!langCode) {
      langCode = LanguageCode.EN;
    }

    try {
      const url = appConfig.VERIFY_EMAIL_LINK + token;
      const templateData = {
        verifyEmailLink: url,
      };

      const info = await this.mailerService.sendMail({
        to: email,
        subject: appConstants.VERIFY_EMAIL_EMAIL_SUBJECT[langCode],
        template: `${appConstants.VERIFY_EMAIL_EMAIL_TEMPLATE}-${langCode}`,
        context: templateData,
      });
      this.logger.verbose(`Response Send email: ${JSON.stringify(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send registration email to ${email}`, error.stack);
    }
  }
}
