import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `[FitMate] ${timestamp} ${level}: ${message}${metaStr}`;
            }),
          ),
        }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, { context: optionalParams[0] });
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, { trace: optionalParams[0], context: optionalParams[1] });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, { context: optionalParams[0] });
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, { context: optionalParams[0] });
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, { context: optionalParams[0] });
  }
}
export const logger = new CustomLogger();
