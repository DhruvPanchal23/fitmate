import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { getRequestContext } from './context';

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

  private getContextMeta(contextName?: string) {
    const store = getRequestContext();
    if (!store) {
      return { context: contextName };
    }

    const executionTimeMs = Date.now() - store.startTime;

    return {
      context: contextName,
      requestId: store.requestId,
      userId: store.userId,
      sessionId: store.sessionId,
      executionTimeMs,
      dbQueriesCount: store.dbQueriesCount,
      cacheHit: store.cacheHit,
      aiProvider: store.aiProvider,
      aiLatency: store.aiLatency,
      aiTokens: store.aiTokens,
    };
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, this.getContextMeta(optionalParams[0]));
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, { trace: optionalParams[0], ...this.getContextMeta(optionalParams[1]) });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, this.getContextMeta(optionalParams[0]));
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, this.getContextMeta(optionalParams[0]));
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, this.getContextMeta(optionalParams[0]));
  }
}
export const logger = new CustomLogger();
