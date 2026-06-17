import { MetricsEngineService } from './metrics-engine.service';
import { HealthService } from './health.service';
import { Response } from 'express';
export declare class HealthController {
    private readonly healthService;
    private readonly metrics;
    constructor(healthService: HealthService, metrics: MetricsEngineService);
    checkLive(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    checkReady(): Promise<{
        status: string;
        database: string;
    }>;
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        components: {
            database: {
                status: string;
            };
            aiProviders: {
                gemini: string;
                openai: string;
            };
            memory: {
                rss: string;
                heapTotal: string;
                heapUsed: string;
            };
            cpu: {
                loadavg: number[];
                cores: number;
            };
            metrics: {
                totalRequests: number;
                totalErrors: number;
                avgLatencyMs: number;
                cacheHitRatio: number;
            };
        };
    }>;
    getMetrics(res: Response): Response<any, Record<string, any>>;
}
