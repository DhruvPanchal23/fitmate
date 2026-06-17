import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsEngineService } from './metrics-engine.service';
import { HealthService } from './health.service';
import { Response } from 'express';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metrics: MetricsEngineService,
  ) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is running.' })
  checkLive() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready to accept traffic.' })
  async checkReady() {
    return this.healthService.checkReady();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detailed system health' })
  @ApiResponse({ status: 200, description: 'Application health status details.' })
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({ status: 200, description: 'Prometheus formatted metrics text.' })
  getMetrics(@Res() res: Response) {
    const formatted = this.metrics.getPrometheusFormat();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    return res.status(HttpStatus.OK).send(formatted);
  }
}
