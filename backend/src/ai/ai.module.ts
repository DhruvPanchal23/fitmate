import { Module } from '@nestjs/common';
import { AIController } from './controllers/ai.controller';
import { AIOrchestratorService } from './orchestrator/ai-orchestrator.service';
import { VisionService } from './vision/vision.service';
import { MockVisionProvider } from './vision/mock-vision-provider.service';
import { FoodMatcherService } from './matcher/food-matcher.service';
import { FoodMatchingEngine } from './matcher/food-matching-engine.service';
import { MealScanRepository } from './meal-scan.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { MealsModule } from '../meals/meals.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { UsersModule } from '../users/users.module';
import { TravelModule } from '../travel/travel.module';

// AI Diet Coach services
import { AICoachService } from './coach/ai-coach.service';
import { AICoachRepository } from './coach/ai-coach.repository';
import { MockLLMProvider } from './llm/mock-llm-provider.service';
import { AIResponseCacheService } from './cache/ai-response-cache.service';
import { AIResponseCacheRepository } from './cache/ai-response-cache.repository';
import { PromptBuilder } from './prompt/prompt-builder.service';
import { ContextBuilderService } from './context/context-builder.service';
import { ResponseFormatter } from './format/response-formatter.service';

// Retrievers
import { ProfileRetriever } from './retrievers/profile.retriever';
import { NutritionRetriever } from './retrievers/nutrition.retriever';
import { MealHistoryRetriever } from './retrievers/meal-history.retriever';
import { ExerciseRetriever } from './retrievers/exercise.retriever';
import { TravelRetriever } from './retrievers/travel.retriever';

@Module({
  imports: [
    PrismaModule,
    MealsModule,
    NutritionModule,
    UsersModule,
    TravelModule,
  ],
  controllers: [AIController],
  providers: [
    // Image scan providers
    AIOrchestratorService,
    VisionService,
    {
      provide: 'VisionProvider',
      useClass: MockVisionProvider,
    },
    FoodMatcherService,
    FoodMatchingEngine,
    MealScanRepository,

    // Coach core providers
    AICoachService,
    AICoachRepository,
    {
      provide: 'LLMProvider',
      useClass: MockLLMProvider,
    },
    AIResponseCacheService,
    AIResponseCacheRepository,
    PromptBuilder,
    ContextBuilderService,
    ResponseFormatter,

    // Context retrievers
    ProfileRetriever,
    NutritionRetriever,
    MealHistoryRetriever,
    ExerciseRetriever,
    TravelRetriever,
  ],
  exports: [AIOrchestratorService, AICoachService],
})
export class AiModule {}
export default AiModule;
