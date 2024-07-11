import 'dotenv/config';
import config from 'config';

const NODE_ENV = process.env.NODE_ENV;

const COOKIE_SECRET = process.env.COOKIE_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const ID_TOKEN_PRIVATE_KEY_AS_BASE64 = process.env.ID_TOKEN_PRIVATE_KEY_AS_BASE64 as string;
const ID_TOKEN_PRIVATE_KEY = Buffer.from(ID_TOKEN_PRIVATE_KEY_AS_BASE64, 'base64').toString('utf8');
const CORS_ALLOWED_ORIGNS = process.env.CORS_ALLOWED_ORIGNS;
const DOMAIN = process.env.DOMAIN;
const SERVER_PORT = process.env.SERVER_PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const smtpSecureAsString = process.env.SMTP_SECURE;
const SMTP_SECURE: boolean = smtpSecureAsString ? smtpSecureAsString.toLowerCase() === 'true' : true;
const ROOT_ACCOUNT_EMAIL = process.env.ROOT_ACCOUNT_EMAIL ?? '';

const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME ?? config.get('cloudinary.name');
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? config.get('cloudinary.apiKey');
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? config.get('cloudinary.apiSecret');

const ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS = config.get<number>('token.access.expiresInAsSeconds');
const REFRESH_TOKEN_EXPIRES_IN_AS_SECONDS = config.get<number>('token.refresh.expiresInAsSeconds');
const ID_TOKEN_EXPIRES_IN_AS_SECONDS = config.get<number>('token.id.expiresInAsSeconds');

const SALT_ROUNDS = config.get<number>('bcrypt.saltRounds');
const RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS = config.get<string>('resetPasswordToken.expiresInHours');

const LOG_LEVEL_CONSOLE = config.get<string>('log.level.console');
const LOG_LEVEL_FILE = config.get<string>('log.level.file');
const LOG_LEVEL_QUERY = config.get<string>('log.level.query');

const RESET_PASSWORD_LINK = config.get<string>('link.reset-password');
const MAIL_SENDER = config.get<string>('mail.sender');

export const appConfig = {
  NODE_ENV,
  COOKIE_SECRET,
  RECAPTCHA_SECRET_KEY,
  ID_TOKEN_PRIVATE_KEY,
  CORS_ALLOWED_ORIGNS,
  DOMAIN,
  SERVER_PORT,
  DATABASE_URL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_SECURE,
  ROOT_ACCOUNT_EMAIL,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS: ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_AS_SECONDS: REFRESH_TOKEN_EXPIRES_IN_AS_SECONDS,
  ID_TOKEN_EXPIRES_IN_AS_SECONDS,
  SALT_ROUNDS,
  RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS: RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS,
  LOG_LEVEL_CONSOLE,
  LOG_LEVEL_FILE,
  LOG_LEVEL_QUERY,
  RESET_PASSWORD_LINK,
  MAIL_SENDER,
};
