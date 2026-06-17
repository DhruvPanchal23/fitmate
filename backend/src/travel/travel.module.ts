import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { TravelRepository } from './travel.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SurplusCalculator } from './engines/surplus-calculator';
import { CompensationEngine } from './engines/compensation-engine';
import { RecoveryPlanner } from './engines/recovery-planner';
import { TravelAnalyticsService } from './travel-analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [TravelController],
  providers: [
    TravelService,
    TravelRepository,
    SurplusCalculator,
    CompensationEngine,
    RecoveryPlanner,
    TravelAnalyticsService,
  ],
  exports: [
    TravelService,
    TravelRepository,
    SurplusCalculator,
    CompensationEngine,
    RecoveryPlanner,
    TravelAnalyticsService,
  ],
})
export class TravelModule {}
export default TravelModule;
