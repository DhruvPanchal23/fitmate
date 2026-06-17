import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsEngineService } from './metrics-engine.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsEngineService,
  ) {}

  async checkReady() {
    try {
      await this.prisma.$executeRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        database: 'disconnected',
      });
    }
  }

  async checkHealth() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$executeRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const geminiKey = process.env.GEMINI_API_KEY ? 'configured' : 'missing';
    const openAiKey = process.env.OPENAI_API_KEY ? 'configured' : 'missing';

    const mem = process.memoryUsage();
    const metricsSummary = this.metrics.getMetricsSummary();

    const healthy = dbStatus === 'connected';

    const healthData = {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components: {
        database: {
          status: dbStatus,
        },
        aiProviders: {
          gemini: geminiKey,
          openai: openAiKey,
        },
        memory: {
          rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
        },
        cpu: {
          loadavg: os.loadavg(),
          cores: os.cpus().length,
        },
        metrics: {
          totalRequests: metricsSummary.totalRequests,
          totalErrors: metricsSummary.totalErrors,
          avgLatencyMs: Math.round(metricsSummary.avgLatency),
          cacheHitRatio: metricsSummary.cacheHitRatio,
        }
      }
    };

    if (!healthy) {
      throw new ServiceUnavailableException(healthData);
    }
    return healthData;
  }
}
export default HealthService;
