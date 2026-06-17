import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../common/logger.service';
import { getRequestContext } from '../common/context';
import * as crypto from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      const resObj = exception.getResponse();
      if (typeof resObj === 'object' && resObj !== null) {
        message = (resObj as any).message || exception.message;
        if (Array.isArray((resObj as any).message)) {
          message = 'Validation failed';
          errors = (resObj as any).message;
        }
      } else {
        message = resObj;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const store = getRequestContext();
    const requestId = store?.requestId || (request.headers['x-request-id'] as string) || crypto.randomUUID();
    const errorId = crypto.randomUUID();

    const safeClientMessage = status >= 500 
      ? 'An unexpected error occurred. Please try again later.'
      : (typeof message === 'string' ? message : JSON.stringify(message));

    const errorResponse = {
      errorId,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      requestId,
      safeClientMessage,
      ...(errors && { errors }),
    };

    logger.error(
      `${request.method} ${request.url} failed with status code ${status}: ${JSON.stringify(message)} [ErrorId: ${errorId}]`,
      exception instanceof Error ? exception.stack : undefined,
      'HttpExceptionFilter'
    );

    response.status(status).json(errorResponse);
  }
}
