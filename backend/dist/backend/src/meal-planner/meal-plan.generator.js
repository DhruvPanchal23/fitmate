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
exports.MealPlanPlanGenerator = void 0;
const common_1 = require("@nestjs/common");
const food_selection_engine_1 = require("./food-selection.engine");
const macro_validation_engine_1 = require("./macro-validation.engine");
const prisma_service_1 = require("../prisma/prisma.service");
let MealPlanPlanGenerator = class MealPlanPlanGenerator {
    constructor(llmProvider, foodSelectionEngine, macroValidationEngine, prisma) {
        this.llmProvider = llmProvider;
        this.foodSelectionEngine = foodSelectionEngine;
        this.macroValidationEngine = macroValidationEngine;
        this.prisma = prisma;
    }
    async generate(ctx) {
        const catalogFoods = await this.prisma.food.findMany();
        const selectedNames = new Set();
        const leftovers = new Set();
        const prefArgs = {
            goal: ctx.goal,
            dietaryPreference: ctx.dietaryPreference,
            allergies: ctx.allergies,
            budgetPreference: ctx.budgetPreference,
            favoriteFoods: ctx.favoriteFoods,
            recentMeals: ctx.recentMeals,
            pantryItems: ctx.pantryItems,
        };
        const rankedBreakfast = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
            mealType: 'Breakfast',
            alreadySelectedNames: selectedNames,
            leftoverIngredients: leftovers,
        });
        const rankedMain = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
            mealType: 'Lunch',
            alreadySelectedNames: selectedNames,
            leftoverIngredients: leftovers,
        });
        const rankedSnacks = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
            mealType: 'Snack',
            alreadySelectedNames: selectedNames,
            leftoverIngredients: leftovers,
        });
        const systemPrompt = [
            'You are the FitMate AI Meal Planner.',
            'Construct a highly structured daily or weekly diet plan based on the user targets.',
            'Return a valid JSON string representing the meal plan.',
        ].join(' ');
        const developerInstructions = [
            'Generate a JSON block matching the structure:',
            '{',
            '  "title": "Diet Plan Title",',
            '  "days": [',
            '    {',
            '      "dayOfWeek": "Monday",',
            '      "meals": [',
            '        { "mealType": "Breakfast", "foodName": "Oatmeal Bowl", "quantity": 100, "unit": "g" },',
            '        { "mealType": "Lunch", "foodName": "Chicken Breast", "quantity": 150, "unit": "g" },',
            '        { "mealType": "Dinner", "foodName": "Paneer Rice", "quantity": 200, "unit": "g" },',
            '        { "mealType": "Snack", "foodName": "Greek Yogurt", "quantity": 150, "unit": "g" }',
            '      ]',
            '    }',
            '  ]',
            '}',
        ].join('\n');
        const contextStr = JSON.stringify({
            type: ctx.type,
            goals: {
                calories: ctx.caloriesTarget,
                protein: ctx.proteinTarget,
                carbs: ctx.carbsTarget,
                fats: ctx.fatTarget,
            },
            allergies: ctx.allergies,
            favorites: ctx.favoriteFoods,
            diet: ctx.dietaryPreference,
            topCandidates: {
                breakfast: rankedBreakfast.slice(0, 5).map(r => r.food.name),
                mainMeals: rankedMain.slice(0, 8).map(r => r.food.name),
                snacks: rankedSnacks.slice(0, 5).map(r => r.food.name),
            }
        }, null, 2);
        const prompt = [
            `=== ROLE ===\n${systemPrompt}`,
            `=== INSTRUCTIONS ===\n${developerInstructions}`,
            `=== USER CONTEXT ===\n${contextStr}`,
            `=== REQUEST ===\nGenerate a ${ctx.type} meal plan matching the user goals.`,
        ].join('\n\n');
        let parsedPlan;
        try {
            const rawResponse = await this.llmProvider.generateResponse(prompt);
            let cleaned = rawResponse.trim();
            if (cleaned.includes('```json')) {
                cleaned = cleaned.split('```json')[1].split('```')[0].trim();
            }
            else if (cleaned.includes('```')) {
                cleaned = cleaned.split('```')[1].split('```')[0].trim();
            }
            parsedPlan = JSON.parse(cleaned);
        }
        catch (e) {
            parsedPlan = this.compileDeterministicFallback(ctx, catalogFoods, rankedBreakfast, rankedMain, rankedSnacks);
        }
        const planDays = [];
        const daysToMap = ctx.type === 'weekly' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Day 1'];
        const parsedDays = Array.isArray(parsedPlan.days) ? parsedPlan.days : [];
        for (let idx = 0; idx < daysToMap.length; idx++) {
            const dayName = daysToMap[idx];
            const parsedDay = parsedDays.find((d) => d.dayOfWeek === dayName) || { meals: [] };
            const dayMeals = [];
            for (const meal of parsedDay.meals) {
                const match = catalogFoods.find((f) => f.name.toLowerCase().includes(meal.foodName?.toLowerCase() || '') ||
                    (meal.foodName && meal.foodName.toLowerCase().includes(f.name.toLowerCase()))) || catalogFoods[0];
                const qty = Number(meal.quantity) || 100;
                const scale = qty / match.servingSize;
                dayMeals.push({
                    mealType: meal.mealType,
                    foodId: match.id,
                    foodName: match.name,
                    quantity: qty,
                    unit: match.defaultUnit,
                    calories: Math.round(match.calories * scale),
                    protein: Math.round(match.protein * scale * 10) / 10,
                    carbs: Math.round(match.carbohydrates * scale * 10) / 10,
                    fats: Math.round(match.fats * scale * 10) / 10,
                    notes: meal.notes || `Healthy ${meal.mealType}`,
                });
            }
            if (dayMeals.length === 0) {
                dayMeals.push(this.createPlannedMeal('Breakfast', rankedBreakfast[0].food, 80), this.createPlannedMeal('Lunch', rankedMain[0].food, 150), this.createPlannedMeal('Dinner', rankedMain[1 % rankedMain.length].food, 150), this.createPlannedMeal('Snack', rankedSnacks[0].food, 100));
            }
            planDays.push({
                dayOfWeek: dayName,
                meals: dayMeals,
            });
        }
        const validation = this.macroValidationEngine.validateAndRebalance(planDays, {
            calories: ctx.caloriesTarget,
            protein: ctx.proteinTarget,
            carbs: ctx.carbsTarget,
            fats: ctx.fatTarget,
        });
        return {
            title: parsedPlan.title || `${ctx.goal.replace('_', ' ')} Plan (v${ctx.type})`,
            goal: ctx.goal,
            type: ctx.type,
            caloriesTarget: ctx.caloriesTarget,
            proteinTarget: ctx.proteinTarget,
            carbsTarget: ctx.carbsTarget,
            fatTarget: ctx.fatTarget,
            days: validation.rebalancedDays,
        };
    }
    compileDeterministicFallback(ctx, catalog, breakfast, main, snacks) {
        const days = ctx.type === 'weekly' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Day 1'];
        return {
            title: `Plan for ${ctx.goal.replace('_', ' ')}`,
            days: days.map((dayName, idx) => {
                const lunchFood = main[idx % main.length].food;
                const dinnerFood = main[(idx + 1) % main.length].food;
                const bfFood = breakfast[idx % breakfast.length].food;
                const snFood = snacks[idx % snacks.length].food;
                return {
                    dayOfWeek: dayName,
                    meals: [
                        { mealType: 'Breakfast', foodName: bfFood.name, quantity: 100, unit: bfFood.defaultUnit },
                        { mealType: 'Lunch', foodName: lunchFood.name, quantity: 150, unit: lunchFood.defaultUnit },
                        { mealType: 'Dinner', foodName: dinnerFood.name, quantity: 150, unit: dinnerFood.defaultUnit },
                        { mealType: 'Snack', foodName: snFood.name, quantity: 120, unit: snFood.defaultUnit },
                    ],
                };
            }),
        };
    }
    createPlannedMeal(type, food, quantity) {
        const scale = quantity / food.servingSize;
        return {
            mealType: type,
            foodId: food.id,
            foodName: food.name,
            quantity,
            unit: food.defaultUnit,
            calories: Math.round(food.calories * scale),
            protein: Math.round(food.protein * scale * 10) / 10,
            carbs: Math.round(food.carbohydrates * scale * 10) / 10,
            fats: Math.round(food.fats * scale * 10) / 10,
            notes: `Healthy ${type}`,
        };
    }
};
exports.MealPlanPlanGenerator = MealPlanPlanGenerator;
exports.MealPlanPlanGenerator = MealPlanPlanGenerator = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('LLMProvider')),
    __metadata("design:paramtypes", [Object, food_selection_engine_1.FoodSelectionEngine,
        macro_validation_engine_1.MacroValidationEngine,
        prisma_service_1.PrismaService])
], MealPlanPlanGenerator);
exports.default = MealPlanPlanGenerator;
//# sourceMappingURL=meal-plan.generator.js.map