import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// Repositories
import { AnalyticsRepository } from './repositories/analytics.repository';
import { InsightRepository } from './repositories/insight.repository';
import { RecommendationRepository } from './repositories/recommendation.repository';

// Engines
import { AdherenceEngine } from './engines/adherence.engine';
import { ConsistencyEngine } from './engines/consistency.engine';
import { StreakEngine } from './engines/streak.engine';
import { TrendEngine } from './engines/trend.engine';
import { PredictionEngine } from './engines/prediction.engine';
import { HealthScoreEngine } from './engines/health-score.engine';
import { RiskEngine } from './engines/risk.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    InsightRepository,
    RecommendationRepository,
    AdherenceEngine,
    ConsistencyEngine,
    StreakEngine,
    TrendEngine,
    PredictionEngine,
    HealthScoreEngine,
    RiskEngine,
    RecommendationEngine,
  ],
  exports: [
    AnalyticsService,
    AnalyticsRepository,
    InsightRepository,
    RecommendationRepository,
    AdherenceEngine,
    ConsistencyEngine,
    StreakEngine,
    TrendEngine,
    PredictionEngine,
    HealthScoreEngine,
    RiskEngine,
    RecommendationEngine,
  ],
})
export class AnalyticsModule {}
export default AnalyticsModule;
