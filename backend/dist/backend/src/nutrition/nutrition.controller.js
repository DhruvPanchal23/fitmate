"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nutrition_service_1 = require("./nutrition.service");
const foods_service_1 = require("./foods.service");
const exercise_service_1 = require("../exercise/exercise.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let NutritionController = class NutritionController {
    constructor(nutritionService, foodsService, exerciseService) {
        this.nutritionService = nutritionService;
        this.foodsService = foodsService;
        this.exerciseService = exerciseService;
    }
    async getTodayLogs(req) {
        return this.nutritionService.getTodayLogs(req.user.id);
    }
    async getSummary(req) {
        return this.nutritionService.getSummary(req.user.id);
    }
    async searchFoods(query) {
        return this.foodsService.searchFoods(query);
    }
    async logWorkout(req, body) {
        return this.exerciseService.logExercise(req.user.id, {
            activityName: 'Quick Workout',
            durationMinutes: 45,
            caloriesBurned: body.burnKcal || 300,
        });
    }
};
exports.NutritionController = NutritionController;
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current daily nutrition macros and targets progress' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daily totals progress details returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "getTodayLogs", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calculated nutritional summaries timeline' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nutritional summaries returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('foods/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search the food catalog by name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Food catalog search results returned.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "searchFoods", null);
__decorate([
    (0, common_1.Post)('log-workout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Quick log calories burned from a workout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workout successfully logged.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NutritionController.prototype, "logWorkout", null);
exports.NutritionController = NutritionController = __decorate([
    (0, swagger_1.ApiTags)('Nutrition'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('nutrition'),
    __metadata("design:paramtypes", [nutrition_service_1.NutritionService,
        foods_service_1.FoodsService,
        exercise_service_1.ExerciseService])
], NutritionController);
//# sourceMappingURL=nutrition.controller.js.map