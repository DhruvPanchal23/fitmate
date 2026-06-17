import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsEngineService } from '../health/metrics-engine.service';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly metrics;
    constructor(metrics: MetricsEngineService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
export default LoggingInterceptor;
