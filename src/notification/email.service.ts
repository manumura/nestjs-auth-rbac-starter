import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { appConstants } from '../app.constants';
import { appConfig } from '../config/config';
import { LanguageCode } from '../user/model/language-code.model';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');

  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(email: string, langCode: string, token: string): Promise<any> {
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
      // throw new Error(`Failed to send reset password email to ${email}`);
    }
  }

  async sendTemporaryPasswordEmail(email: string, langCode: string, password: string): Promise<any> {
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
      // throw new Error(`Failed to send temporary password email to ${email}`);
    }
  }
}
