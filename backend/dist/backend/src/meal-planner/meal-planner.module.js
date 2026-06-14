"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealPlannerModule = void 0;
const common_1 = require("@nestjs/common");
const meal_planner_controller_1 = require("./meal-planner.controller");
const meal_planner_service_1 = require("./meal-planner.service");
const meal_plan_repository_1 = require("./meal-plan.repository");
const pantry_repository_1 = require("./pantry.repository");
const meal_plan_generator_1 = require("./meal-plan.generator");
const food_selection_engine_1 = require("./food-selection.engine");
const macro_validation_engine_1 = require("./macro-validation.engine");
const meal_diversity_score_service_1 = require("./meal-diversity-score.service");
const prisma_module_1 = require("../prisma/prisma.module");
const users_module_1 = require("../users/users.module");
const meals_module_1 = require("../meals/meals.module");
const ai_module_1 = require("../ai/ai.module");
let MealPlannerModule = class MealPlannerModule {
};
exports.MealPlannerModule = MealPlannerModule;
exports.MealPlannerModule = MealPlannerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, users_module_1.UsersModule, meals_module_1.MealsModule, ai_module_1.AiModule],
        controllers: [meal_planner_controller_1.MealPlannerController],
        providers: [
            meal_planner_service_1.MealPlannerService,
            meal_plan_repository_1.MealPlanRepository,
            pantry_repository_1.PantryRepository,
            meal_plan_generator_1.MealPlanPlanGenerator,
            food_selection_engine_1.FoodSelectionEngine,
            macro_validation_engine_1.MacroValidationEngine,
            meal_diversity_score_service_1.MealDiversityScoreService,
        ],
        exports: [meal_planner_service_1.MealPlannerService, meal_plan_repository_1.MealPlanRepository, pantry_repository_1.PantryRepository],
    })
], MealPlannerModule);
exports.default = MealPlannerModule;
//# sourceMappingURL=meal-planner.module.js.map