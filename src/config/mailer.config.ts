import { appConfig } from './app.config.js';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

// https://nest-modules.github.io/mailer/docs/mailer
export const mailerTransportOptions = {
  host: appConfig.SMTP_HOST,
  port: Number(appConfig.SMTP_PORT),
  secure: appConfig.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: appConfig.SMTP_USER,
    pass: appConfig.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export const mailerOptions: MailerOptions = {
  transport: mailerTransportOptions,
  defaults: {
    from: appConfig.MAIL_SENDER,
  },
  template: {
    dir: './templates',
    adapter: new HandlebarsAdapter(), // or new PugAdapter()
    options: {
      strict: true,
    },
  },
};
