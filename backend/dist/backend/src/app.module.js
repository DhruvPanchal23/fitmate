"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const health_module_1 = require("./health/health.module");
const meals_module_1 = require("./meals/meals.module");
const water_module_1 = require("./water/water.module");
const supplements_module_1 = require("./supplements/supplements.module");
const exercise_module_1 = require("./exercise/exercise.module");
const nutrition_module_1 = require("./nutrition/nutrition.module");
const ai_module_1 = require("./ai/ai.module");
const travel_module_1 = require("./travel/travel.module");
const meal_planner_module_1 = require("./meal-planner/meal-planner.module");
const request_id_middleware_1 = require("./middleware/request-id.middleware");
const configuration_1 = require("./config/configuration");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_id_middleware_1.RequestIdMiddleware)
            .forRoutes({ path: '*path', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
            meals_module_1.MealsModule,
            water_module_1.WaterModule,
            supplements_module_1.SupplementsModule,
            exercise_module_1.ExerciseModule,
            nutrition_module_1.NutritionModule,
            ai_module_1.AiModule,
            travel_module_1.TravelModule,
            meal_planner_module_1.MealPlannerModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map