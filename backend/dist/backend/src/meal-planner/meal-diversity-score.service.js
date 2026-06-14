"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealDiversityScoreService = void 0;
const common_1 = require("@nestjs/common");
let MealDiversityScoreService = class MealDiversityScoreService {
    calculateScore(days) {
        if (!days || days.length === 0)
            return 100;
        let totalScore = 100;
        const foodFrequency = {};
        const mealFrequency = {};
        for (const day of days) {
            const dayFoods = new Set();
            for (const meal of day.meals) {
                if (!meal.foodName)
                    continue;
                if (dayFoods.has(meal.foodName)) {
                    totalScore -= 15;
                }
                dayFoods.add(meal.foodName);
                foodFrequency[meal.foodName] = (foodFrequency[meal.foodName] || 0) + 1;
                const mealKey = `${meal.mealType}:${meal.foodName}`;
                mealFrequency[mealKey] = (mealFrequency[mealKey] || 0) + 1;
            }
        }
        for (const food of Object.keys(foodFrequency)) {
            const count = foodFrequency[food];
            if (count > 4) {
                totalScore -= (count - 4) * 5;
            }
        }
        for (const mealKey of Object.keys(mealFrequency)) {
            const count = mealFrequency[mealKey];
            if (count > 3) {
                totalScore -= (count - 3) * 5;
            }
        }
        return Math.max(10, totalScore);
    }
};
exports.MealDiversityScoreService = MealDiversityScoreService;
exports.MealDiversityScoreService = MealDiversityScoreService = __decorate([
    (0, common_1.Injectable)()
], MealDiversityScoreService);
exports.default = MealDiversityScoreService;
//# sourceMappingURL=meal-diversity-score.service.js.map