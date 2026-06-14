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
const ai_coach_service_1 = require("./coach/ai-coach.service");
const ai_coach_repository_1 = require("./coach/ai-coach.repository");
const mock_llm_provider_service_1 = require("./llm/mock-llm-provider.service");
const ai_response_cache_service_1 = require("./cache/ai-response-cache.service");
const ai_response_cache_repository_1 = require("./cache/ai-response-cache.repository");
const prompt_builder_service_1 = require("./prompt/prompt-builder.service");
const context_builder_service_1 = require("./context/context-builder.service");
const response_formatter_service_1 = require("./format/response-formatter.service");
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
            ai_coach_service_1.AICoachService,
            ai_coach_repository_1.AICoachRepository,
            {
                provide: 'LLMProvider',
                useClass: mock_llm_provider_service_1.MockLLMProvider,
            },
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
        ],
        exports: [ai_orchestrator_service_1.AIOrchestratorService, ai_coach_service_1.AICoachService],
    })
], AiModule);
exports.default = AiModule;
//# sourceMappingURL=ai.module.js.map