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
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsRetriever } from './retrievers/analytics.retriever';
import { NotificationsRetriever } from './retrievers/notifications.retriever';

// AI Diet Coach & Providers
import { AICoachService } from './coach/ai-coach.service';
import { AICoachRepository } from './coach/ai-coach.repository';
import { AIResponseCacheService } from './cache/ai-response-cache.service';
import { AIResponseCacheRepository } from './cache/ai-response-cache.repository';
import { PromptBuilder } from './prompt/prompt-builder.service';
import { ContextBuilderService } from './context/context-builder.service';
import { ResponseFormatter } from './format/response-formatter.service';

// Core Providers
import { AIProviderOrchestrator } from './core/ai-provider-orchestrator.service';
import { GeminiProvider } from './core/gemini-provider';
import { OpenAIProvider } from './core/openai-provider';
import { AnthropicProvider } from './core/anthropic-provider';
import { MockProvider } from './core/mock-provider';
import { AIPipelineService } from './core/ai-pipeline.service';

// RAG Engine
import { EmbeddingService } from './rag/embedding.service';
import { ChunkService } from './rag/chunk.service';
import { RetrievalService } from './rag/retrieval.service';

// Memory Engine
import { MemoryService } from './memory/memory.service';

// Prompt Registry & Safety Guard
import { PromptRegistryService } from './prompt/prompt-registry.service';
import { ResponseGuardService } from './guard/response-guard.service';

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
    AnalyticsModule,
    NotificationsModule,
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

    // Core AI Providers
    GeminiProvider,
    OpenAIProvider,
    AnthropicProvider,
    MockProvider,
    AIProviderOrchestrator,
    {
      provide: 'AIProvider',
      useClass: AIProviderOrchestrator,
    },
    {
      provide: 'LLMProvider',
      useClass: AIProviderOrchestrator,
    },
    AIPipelineService,

    // RAG Engine
    EmbeddingService,
    ChunkService,
    RetrievalService,

    // Memory Engine
    MemoryService,

    // Prompt Registry & Safety Guard
    PromptRegistryService,
    ResponseGuardService,

    // Coach core providers
    AICoachService,
    AICoachRepository,
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
    AnalyticsRetriever,
    NotificationsRetriever,
  ],
  exports: [
    AIOrchestratorService,
    AICoachService,
    AnalyticsRetriever,
    NotificationsRetriever,
    RetrievalService,
    MemoryService,
    PromptRegistryService,
    ResponseGuardService,
    'AIProvider',
    'LLMProvider',
    AIPipelineService
  ],
})
export class AiModule {}
export default AiModule;
