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
exports.NutritionCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const meals_repository_1 = require("../meals/meals.repository");
const water_repository_1 = require("../water/water.repository");
const supplements_repository_1 = require("../supplements/supplements.repository");
const exercise_repository_1 = require("../exercise/exercise.repository");
let NutritionCalculatorService = class NutritionCalculatorService {
    constructor(mealsRepository, waterRepository, supplementsRepository, exerciseRepository) {
        this.mealsRepository = mealsRepository;
        this.waterRepository = waterRepository;
        this.supplementsRepository = supplementsRepository;
        this.exerciseRepository = exerciseRepository;
    }
    async calculateDailySummary(userId, dateStr) {
        const [meals, waterLogs, supplementLogs, exerciseLogs] = await Promise.all([
            this.mealsRepository.findMany(userId, dateStr),
            this.waterRepository.findMany(userId, dateStr),
            this.supplementsRepository.findMany(userId, dateStr),
            this.exerciseRepository.findMany(userId, dateStr),
        ]);
        let calories = 0;
        let protein = 0;
        let carbohydrates = 0;
        let fats = 0;
        let fiber = 0;
        let sugar = 0;
        for (const meal of meals) {
            if ('items' in meal && Array.isArray(meal.items)) {
                for (const item of meal.items) {
                    calories += item.calories || 0;
                    protein += item.protein || 0;
                    carbohydrates += item.carbohydrates || 0;
                    fats += item.fats || 0;
                    fiber += item.fiber || 0;
                    sugar += item.sugar || 0;
                }
            }
        }
        const water = waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
        const supplements = Array.from(new Set(supplementLogs.map(log => log.name)));
        const exerciseCalories = exerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
        return {
            date: dateStr,
            calories: Math.round(calories * 10),
            protein: Math.round(protein * 10),
            carbohydrates: Math.round(carbohydrates * 10),
            fats: Math.round(fats * 10),
            fiber: Math.round(fiber * 10),
            sugar: Math.round(sugar * 10),
            water: Math.round(water),
            supplements,
            exerciseCalories: Math.round(exerciseCalories),
        };
    }
};
exports.NutritionCalculatorService = NutritionCalculatorService;
exports.NutritionCalculatorService = NutritionCalculatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meals_repository_1.MealsRepository,
        water_repository_1.WaterRepository,
        supplements_repository_1.SupplementsRepository,
        exercise_repository_1.ExerciseRepository])
], NutritionCalculatorService);
//# sourceMappingURL=nutrition-calculator.service.js.map