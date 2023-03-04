import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { appConfig } from './config';

const consoleTransportOptions: ConsoleTransportOptions = {
  format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
  level: appConfig.LOG_LEVEL_CONSOLE,
};
const fileTransportOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
  format: winston.format.combine(winston.format.timestamp(), winston.format.splat(), winston.format.json()),
  filename: 'application-%DATE%.log',
  dirname: './logs',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d',
  level: appConfig.LOG_LEVEL_FILE,
};

export const loggerOptions: winston.LoggerOptions = {
  transports: [new winston.transports.Console(consoleTransportOptions), new DailyRotateFile(fileTransportOptions)],
};
