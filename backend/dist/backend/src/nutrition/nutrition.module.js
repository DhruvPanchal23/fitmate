"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionModule = void 0;
const common_1 = require("@nestjs/common");
const nutrition_service_1 = require("./nutrition.service");
const nutrition_controller_1 = require("./nutrition.controller");
const nutrition_calculator_service_1 = require("./nutrition-calculator.service");
const foods_service_1 = require("./foods.service");
const foods_repository_1 = require("./foods.repository");
const users_module_1 = require("../users/users.module");
const meals_module_1 = require("../meals/meals.module");
const water_module_1 = require("../water/water.module");
const supplements_module_1 = require("../supplements/supplements.module");
const exercise_module_1 = require("../exercise/exercise.module");
const prisma_module_1 = require("../prisma/prisma.module");
let NutritionModule = class NutritionModule {
};
exports.NutritionModule = NutritionModule;
exports.NutritionModule = NutritionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            meals_module_1.MealsModule,
            water_module_1.WaterModule,
            supplements_module_1.SupplementsModule,
            exercise_module_1.ExerciseModule,
        ],
        controllers: [nutrition_controller_1.NutritionController],
        providers: [
            nutrition_service_1.NutritionService,
            nutrition_calculator_service_1.NutritionCalculatorService,
            foods_service_1.FoodsService,
            foods_repository_1.FoodsRepository,
        ],
        exports: [
            nutrition_service_1.NutritionService,
            nutrition_calculator_service_1.NutritionCalculatorService,
            foods_service_1.FoodsService,
            foods_repository_1.FoodsRepository,
        ],
    })
], NutritionModule);
//# sourceMappingURL=nutrition.module.js.map