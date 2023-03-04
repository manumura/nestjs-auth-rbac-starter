import { cleanEnv, url, port, str, bool, num, host } from 'envalid';

import { appConfig } from './config';

export function validateEnv() {
  cleanEnv(appConfig, {
    NODE_ENV: str(),
    SERVER_BASEURL: url(),
    SERVER_PORT: port(),
    SERVER_PROTOCOL: str(),
    SERVER_HOST: host(),
    DATABASE_URL: str(),
    SMTP_HOST: str(),
    SMTP_PORT: port(),
    SMTP_USER: str(),
    SMTP_PASSWORD: str(),
    SMTP_SECURE: bool(),
    ACCESS_TOKEN_EXPIRES_IN_AS_SECONDS: num(),
    REFRESH_TOKEN_EXPIRY_DURATION_IN_AS_SECONDS: num(),
    SALT_ROUNDS: num(),
    RESET_PASSWORD_TOKEN_EXPIRY_DURATION_IN_HOURS: num(),
    LOG_LEVEL_CONSOLE: str(),
    LOG_LEVEL_FILE: str(),
    LOG_LEVEL_QUERY: str(),
    RESET_PASSWORD_LINK: str(),
    MAIL_SENDER: str(),
  });
}
