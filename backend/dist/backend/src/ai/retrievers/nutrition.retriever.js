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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionRetriever = void 0;
const common_1 = require("@nestjs/common");
const nutrition_service_1 = require("../../nutrition/nutrition.service");
const nutrition_calculator_service_1 = require("../../nutrition/nutrition-calculator.service");
let NutritionRetriever = class NutritionRetriever {
    constructor(nutritionService, calculator) {
        this.nutritionService = nutritionService;
        this.calculator = calculator;
    }
    async retrieve(userId) {
        try {
            const todayLogs = await this.nutritionService.getTodayLogs(userId);
            const todayStr = new Date().toISOString().split('T')[0];
            const summary = await this.calculator.calculateDailySummary(userId, todayStr);
            const caloriesEaten = todayLogs.calories.current;
            const calorieTarget = todayLogs.calories.target;
            const exerciseBurn = summary.exerciseCalories || 0;
            const calorieBalance = caloriesEaten - calorieTarget;
            return {
                calorieTarget,
                proteinTarget: todayLogs.protein.target,
                carbsTarget: todayLogs.carbs.target,
                fatTarget: todayLogs.fat.target,
                waterTarget: todayLogs.water.target,
                todayMacros: {
                    calories: caloriesEaten,
                    protein: todayLogs.protein.current,
                    carbohydrates: todayLogs.carbs.current,
                    fats: todayLogs.fat.current,
                },
                hydration: {
                    current: todayLogs.water.current,
                    target: todayLogs.water.target,
                    status: todayLogs.water.current >= todayLogs.water.target ? 'Fully Hydrated' : 'Dehydrated',
                },
                calorieBalance,
                exerciseBurn,
            };
        }
        catch (e) {
            return null;
        }
    }
};
exports.NutritionRetriever = NutritionRetriever;
exports.NutritionRetriever = NutritionRetriever = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nutrition_service_1.NutritionService,
        nutrition_calculator_service_1.NutritionCalculatorService])
], NutritionRetriever);
//# sourceMappingURL=nutrition.retriever.js.map