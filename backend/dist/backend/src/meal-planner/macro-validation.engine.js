"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacroValidationEngine = void 0;
const common_1 = require("@nestjs/common");
let MacroValidationEngine = class MacroValidationEngine {
    validateAndRebalance(days, targets) {
        const rebalancedDays = days.map((day) => {
            let dayCalories = 0;
            let dayProtein = 0;
            let dayCarbs = 0;
            let dayFats = 0;
            for (const meal of day.meals) {
                dayCalories += meal.calories || 0;
                dayProtein += meal.protein || 0;
                dayCarbs += meal.carbs || 0;
                dayFats += meal.fats || 0;
            }
            if (dayCalories === 0) {
                return { ...day, calories: 0, protein: 0, carbs: 0, fats: 0 };
            }
            const calDiff = Math.abs(dayCalories - targets.calories) / targets.calories;
            if (calDiff > 0.05) {
                const scale = targets.calories / dayCalories;
                const rebalancedMeals = day.meals.map((meal) => {
                    const newQty = Math.round(meal.quantity * scale * 10) / 10;
                    return {
                        ...meal,
                        quantity: newQty,
                        calories: Math.round(meal.calories * scale),
                        protein: Math.round(meal.protein * scale * 10) / 10,
                        carbs: Math.round(meal.carbs * scale * 10) / 10,
                        fats: Math.round(meal.fats * scale * 10) / 10,
                    };
                });
                let finalCal = 0;
                let finalProt = 0;
                let finalCarbs = 0;
                let finalFats = 0;
                for (const m of rebalancedMeals) {
                    finalCal += m.calories;
                    finalProt += m.protein;
                    finalCarbs += m.carbs;
                    finalFats += m.fats;
                }
                return {
                    ...day,
                    calories: finalCal,
                    protein: Math.round(finalProt * 10) / 10,
                    carbs: Math.round(finalCarbs * 10) / 10,
                    fats: Math.round(finalFats * 10) / 10,
                    meals: rebalancedMeals,
                };
            }
            return {
                ...day,
                calories: dayCalories,
                protein: Math.round(dayProtein * 10) / 10,
                carbs: Math.round(dayCarbs * 10) / 10,
                fats: Math.round(dayFats * 10) / 10,
            };
        });
        let allValid = true;
        for (const d of rebalancedDays) {
            if (d.calories === 0) {
                allValid = false;
                break;
            }
            const finalCalDiff = Math.abs(d.calories - targets.calories) / targets.calories;
            if (finalCalDiff > 0.05) {
                allValid = false;
            }
        }
        return {
            isValid: allValid,
            rebalancedDays,
        };
    }
};
exports.MacroValidationEngine = MacroValidationEngine;
exports.MacroValidationEngine = MacroValidationEngine = __decorate([
    (0, common_1.Injectable)()
], MacroValidationEngine);
exports.default = MacroValidationEngine;
//# sourceMappingURL=macro-validation.engine.js.map