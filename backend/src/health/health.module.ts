import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsEngineService } from './metrics-engine.service';
import { HealthService } from './health.service';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [MetricsEngineService, HealthService],
  exports: [MetricsEngineService, HealthService],
})
export class HealthModule {}
