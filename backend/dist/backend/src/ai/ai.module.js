"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./controllers/ai.controller");
const ai_orchestrator_service_1 = require("./orchestrator/ai-orchestrator.service");
const vision_service_1 = require("./vision/vision.service");
const mock_vision_provider_service_1 = require("./vision/mock-vision-provider.service");
const food_matcher_service_1 = require("./matcher/food-matcher.service");
const food_matching_engine_service_1 = require("./matcher/food-matching-engine.service");
const meal_scan_repository_1 = require("./meal-scan.repository");
const prisma_module_1 = require("../prisma/prisma.module");
const meals_module_1 = require("../meals/meals.module");
const nutrition_module_1 = require("../nutrition/nutrition.module");
const users_module_1 = require("../users/users.module");
const travel_module_1 = require("../travel/travel.module");
const analytics_module_1 = require("../analytics/analytics.module");
const notifications_module_1 = require("../notifications/notifications.module");
const analytics_retriever_1 = require("./retrievers/analytics.retriever");
const notifications_retriever_1 = require("./retrievers/notifications.retriever");
const ai_coach_service_1 = require("./coach/ai-coach.service");
const ai_coach_repository_1 = require("./coach/ai-coach.repository");
const ai_response_cache_service_1 = require("./cache/ai-response-cache.service");
const ai_response_cache_repository_1 = require("./cache/ai-response-cache.repository");
const prompt_builder_service_1 = require("./prompt/prompt-builder.service");
const context_builder_service_1 = require("./context/context-builder.service");
const response_formatter_service_1 = require("./format/response-formatter.service");
const ai_provider_orchestrator_service_1 = require("./core/ai-provider-orchestrator.service");
const gemini_provider_1 = require("./core/gemini-provider");
const openai_provider_1 = require("./core/openai-provider");
const anthropic_provider_1 = require("./core/anthropic-provider");
const mock_provider_1 = require("./core/mock-provider");
const ai_pipeline_service_1 = require("./core/ai-pipeline.service");
const embedding_service_1 = require("./rag/embedding.service");
const chunk_service_1 = require("./rag/chunk.service");
const retrieval_service_1 = require("./rag/retrieval.service");
const memory_service_1 = require("./memory/memory.service");
const prompt_registry_service_1 = require("./prompt/prompt-registry.service");
const response_guard_service_1 = require("./guard/response-guard.service");
const profile_retriever_1 = require("./retrievers/profile.retriever");
const nutrition_retriever_1 = require("./retrievers/nutrition.retriever");
const meal_history_retriever_1 = require("./retrievers/meal-history.retriever");
const exercise_retriever_1 = require("./retrievers/exercise.retriever");
const travel_retriever_1 = require("./retrievers/travel.retriever");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            meals_module_1.MealsModule,
            nutrition_module_1.NutritionModule,
            users_module_1.UsersModule,
            travel_module_1.TravelModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [ai_controller_1.AIController],
        providers: [
            ai_orchestrator_service_1.AIOrchestratorService,
            vision_service_1.VisionService,
            {
                provide: 'VisionProvider',
                useClass: mock_vision_provider_service_1.MockVisionProvider,
            },
            food_matcher_service_1.FoodMatcherService,
            food_matching_engine_service_1.FoodMatchingEngine,
            meal_scan_repository_1.MealScanRepository,
            gemini_provider_1.GeminiProvider,
            openai_provider_1.OpenAIProvider,
            anthropic_provider_1.AnthropicProvider,
            mock_provider_1.MockProvider,
            ai_provider_orchestrator_service_1.AIProviderOrchestrator,
            {
                provide: 'AIProvider',
                useClass: ai_provider_orchestrator_service_1.AIProviderOrchestrator,
            },
            {
                provide: 'LLMProvider',
                useClass: ai_provider_orchestrator_service_1.AIProviderOrchestrator,
            },
            ai_pipeline_service_1.AIPipelineService,
            embedding_service_1.EmbeddingService,
            chunk_service_1.ChunkService,
            retrieval_service_1.RetrievalService,
            memory_service_1.MemoryService,
            prompt_registry_service_1.PromptRegistryService,
            response_guard_service_1.ResponseGuardService,
            ai_coach_service_1.AICoachService,
            ai_coach_repository_1.AICoachRepository,
            ai_response_cache_service_1.AIResponseCacheService,
            ai_response_cache_repository_1.AIResponseCacheRepository,
            prompt_builder_service_1.PromptBuilder,
            context_builder_service_1.ContextBuilderService,
            response_formatter_service_1.ResponseFormatter,
            profile_retriever_1.ProfileRetriever,
            nutrition_retriever_1.NutritionRetriever,
            meal_history_retriever_1.MealHistoryRetriever,
            exercise_retriever_1.ExerciseRetriever,
            travel_retriever_1.TravelRetriever,
            analytics_retriever_1.AnalyticsRetriever,
            notifications_retriever_1.NotificationsRetriever,
        ],
        exports: [
            ai_orchestrator_service_1.AIOrchestratorService,
            ai_coach_service_1.AICoachService,
            analytics_retriever_1.AnalyticsRetriever,
            notifications_retriever_1.NotificationsRetriever,
            retrieval_service_1.RetrievalService,
            memory_service_1.MemoryService,
            prompt_registry_service_1.PromptRegistryService,
            response_guard_service_1.ResponseGuardService,
            'AIProvider',
            'LLMProvider',
            ai_pipeline_service_1.AIPipelineService
        ],
    })
], AiModule);
exports.default = AiModule;
//# sourceMappingURL=ai.module.js.map