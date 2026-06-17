import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { QueryPerformanceService } from './query-performance.service';

@Global()
@Module({
  providers: [PrismaService, QueryPerformanceService],
  exports: [PrismaService, QueryPerformanceService],
})
export class PrismaModule {}
