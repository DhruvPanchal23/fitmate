import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check health status of application and database connection' })
  @ApiResponse({ status: 200, description: 'Application is healthy.' })
  async checkHealth() {
    try {
      // Run a simple query to verify database connection
      await this.prisma.$executeRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'degraded',
        database: 'disconnected',
      };
    }
  }
}
