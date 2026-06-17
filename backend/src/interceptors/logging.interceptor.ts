import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { logger } from '../common/logger.service';
import { MetricsEngineService } from '../health/metrics-engine.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsEngineService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        // Track request in metrics engine
        this.metrics.trackRequest(delay, response.statusCode >= 400);

        logger.log(
          `${method} ${url} ${response.statusCode} - ${delay}ms`,
          'LoggingInterceptor',
        );
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        // Track failed request in metrics engine
        this.metrics.trackRequest(delay, true);
        throw err;
      })
    );
  }
}
export default LoggingInterceptor;
