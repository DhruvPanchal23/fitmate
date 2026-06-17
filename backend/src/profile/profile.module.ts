import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './profile.repository';
import { GoalCalculationService } from './goal-calculation.service';
import { GoalEngineFacade } from './goal-engine.facade';
import { HealthScoreService } from './health-score.service';
import { ContextProfileBuilder } from './context-profile-builder.service';
import { ProfileEventsBroker } from './profile-events.broker';
import { ManualMeasurementProvider } from './providers/measurement-provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileRepository,
    GoalCalculationService,
    GoalEngineFacade,
    HealthScoreService,
    ContextProfileBuilder,
    ProfileEventsBroker,
    ManualMeasurementProvider,
  ],
  exports: [
    ProfileService,
    GoalEngineFacade,
    ContextProfileBuilder,
  ],
})
export class ProfileModule {}
export default ProfileModule;
