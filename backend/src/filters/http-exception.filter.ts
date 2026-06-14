import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../common/logger.service';

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

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errors && { errors }),
    };

    logger.error(
      `${request.method} ${request.url} failed with status code ${status}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
      'HttpExceptionFilter'
    );

    response.status(status).json(errorResponse);
  }
}
