import { cleanEnv, port, str, bool, num } from 'envalid';

import { appConfig } from './config';

export function validateEnv() {
  cleanEnv(appConfig, {
    NODE_ENV: str(),
    COOKIE_SECRET: str(),
    ID_TOKEN_PRIVATE_KEY: str(),
    CORS_ALLOWED_ORIGNS: str(),
    SERVER_PORT: port(),
    DATABASE_URL: str(),
    SMTP_HOST: str(),
    SMTP_PORT: port(),
    SMTP_USER: str(),
    SMTP_PASSWORD: str(),
    SMTP_SECURE: bool(),
    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS: num(),
    REFRESH_TOKEN_EXPIRES_IN_AS_SECONDS: num(),
    ID_TOKEN_EXPIRES_IN_AS_SECONDS: num(),
    SALT_ROUNDS: num(),
    RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS: num(),
    LOG_LEVEL_CONSOLE: str(),
    LOG_LEVEL_FILE: str(),
    LOG_LEVEL_QUERY: str(),
    RESET_PASSWORD_LINK: str(),
    MAIL_SENDER: str(),
  });
}
