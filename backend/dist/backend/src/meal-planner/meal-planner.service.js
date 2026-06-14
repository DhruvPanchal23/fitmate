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
exports.MealPlannerService = void 0;
const common_1 = require("@nestjs/common");
const meal_plan_repository_1 = require("./meal-plan.repository");
const pantry_repository_1 = require("./pantry.repository");
const meal_plan_generator_1 = require("./meal-plan.generator");
const food_selection_engine_1 = require("./food-selection.engine");
const users_service_1 = require("../users/users.service");
const meals_service_1 = require("../meals/meals.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MealPlannerService = class MealPlannerService {
    constructor(repository, pantryRepository, generator, selectionEngine, usersService, mealsService, prisma) {
        this.repository = repository;
        this.pantryRepository = pantryRepository;
        this.generator = generator;
        this.selectionEngine = selectionEngine;
        this.usersService = usersService;
        this.mealsService = mealsService;
        this.prisma = prisma;
    }
    async generatePlan(userId, dto) {
        const profile = await this.usersService.getProfile(userId);
        if (!profile) {
            throw new common_1.BadRequestException('User profile must exist to generate plans');
        }
        let calTarget = 2200;
        let protTarget = 150;
        let carbsTarget = 200;
        let fatTarget = 70;
        if (profile.goal === 'fat_loss') {
            calTarget = 1800;
            protTarget = 160;
            carbsTarget = 170;
            fatTarget = 60;
        }
        else if (profile.goal === 'muscle_gain') {
            calTarget = 2700;
            protTarget = 180;
            carbsTarget = 280;
            fatTarget = 80;
        }
        const pantryItems = await this.pantryRepository.findUserPantry(userId);
        const pantryArgs = pantryItems.map((pi) => ({ foodId: pi.foodId, quantity: pi.quantity }));
        const favoriteFoodsRaw = await this.prisma.mealItem.groupBy({
            by: ['foodName'],
            where: { meal: { userId } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        });
        const favoriteFoods = favoriteFoodsRaw.map(item => item.foodName);
        const genCtx = {
            userId,
            type: dto.type,
            goal: dto.goal,
            caloriesTarget: calTarget,
            proteinTarget: protTarget,
            carbsTarget: carbsTarget,
            fatTarget: fatTarget,
            dietaryPreference: dto.dietaryPreference || 'none',
            allergies: dto.allergies || [],
            budgetPreference: dto.budgetPreference || 'medium',
            favoriteFoods,
            pantryItems: pantryArgs,
        };
        const newPlanData = await this.generator.generate(genCtx);
        const savedPlan = await this.repository.create(userId, {
            title: dto.title,
            type: dto.type,
            goal: dto.goal,
            caloriesTarget: calTarget,
            proteinTarget: protTarget,
            carbsTarget: carbsTarget,
            fatTarget: fatTarget,
            status: 'draft',
            startDate: dto.startDate,
            endDate: dto.endDate,
            timezone: dto.timezone,
            days: newPlanData.days,
        });
        await this.repository.logInteraction(userId, {
            planId: savedPlan.id,
            interactionType: 'accepted_meal',
        });
        return savedPlan;
    }
    async getPlans(userId) {
        return this.repository.findUserPlans(userId);
    }
    async getPlan(id) {
        const plan = await this.repository.findPlan(id);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        return plan;
    }
    async deletePlan(id) {
        await this.repository.delete(id);
        return { success: true };
    }
    async updatePlanTitle(id, title) {
        return this.prisma.mealPlan.update({
            where: { id },
            data: { title },
        });
    }
    async activatePlan(userId, planId) {
        const plan = await this.repository.findPlan(planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        await this.repository.archiveActivePlans(userId);
        await this.repository.updatePlanStatus(planId, 'active');
        return { success: true, planId };
    }
    async replaceMeal(userId, dto) {
        const plan = await this.repository.findPlan(dto.planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        let targetMeal = null;
        let targetDay = null;
        for (const d of plan.days) {
            const found = d.meals.find((m) => m.id === dto.mealId);
            if (found) {
                targetMeal = found;
                targetDay = d;
                break;
            }
        }
        if (!targetMeal)
            throw new common_1.NotFoundException('Planned meal slot not found');
        const food = await this.prisma.food.findUnique({ where: { id: dto.foodId } });
        if (!food)
            throw new common_1.NotFoundException('Replacement food not found in catalog');
        const scale = targetMeal.calories / food.calories;
        const newQty = Math.round(food.servingSize * scale * 10) / 10;
        await this.repository.updateMeal(dto.mealId, {
            foodId: food.id,
            quantity: newQty,
            unit: food.defaultUnit,
            calories: targetMeal.calories,
            protein: Math.round(food.protein * scale * 10) / 10,
            carbs: Math.round(food.carbohydrates * scale * 10) / 10,
            fats: Math.round(food.fats * scale * 10) / 10,
            notes: `Replaced with ${food.name}`,
            status: 'replaced',
        });
        await this.repository.incrementReplacements(dto.planId);
        await this.repository.logInteraction(userId, {
            planId: dto.planId,
            mealId: dto.mealId,
            foodId: food.id,
            interactionType: 'replaced_meal',
        });
        return this.getPlan(dto.planId);
    }
    async replaceIngredient(userId, dto) {
        const plan = await this.repository.findPlan(dto.planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        let targetMeal = null;
        for (const d of plan.days) {
            const found = d.meals.find((m) => m.id === dto.mealId);
            if (found) {
                targetMeal = found;
                break;
            }
        }
        if (!targetMeal)
            throw new common_1.NotFoundException('Meal item not found');
        const newFood = await this.prisma.food.findUnique({ where: { id: dto.newFoodId } });
        if (!newFood)
            throw new common_1.NotFoundException('New food not found in catalog');
        const scale = targetMeal.calories / newFood.calories;
        const newQty = Math.round(newFood.servingSize * scale * 10) / 10;
        await this.repository.updateMeal(dto.mealId, {
            foodId: newFood.id,
            quantity: newQty,
            unit: newFood.defaultUnit,
            calories: targetMeal.calories,
            protein: Math.round(newFood.protein * scale * 10) / 10,
            carbs: Math.round(newFood.carbohydrates * scale * 10) / 10,
            fats: Math.round(newFood.fats * scale * 10) / 10,
            notes: `Ingredient swapped to ${newFood.name}`,
            status: 'replaced',
        });
        await this.repository.incrementReplacements(dto.planId);
        await this.repository.logInteraction(userId, {
            planId: dto.planId,
            mealId: dto.mealId,
            foodId: newFood.id,
            interactionType: 'replaced_meal',
        });
        return this.getPlan(dto.planId);
    }
    async regeneratePart(userId, dto) {
        const plan = await this.repository.findPlan(dto.planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        const catalogFoods = await this.prisma.food.findMany();
        if (dto.mealId) {
            let targetMeal = null;
            for (const d of plan.days) {
                const found = d.meals.find((m) => m.id === dto.mealId);
                if (found) {
                    targetMeal = found;
                    break;
                }
            }
            if (!targetMeal)
                throw new common_1.NotFoundException('Meal slot not found');
            const ranked = this.selectionEngine.rankFoods(catalogFoods, { goal: plan.goal }, { mealType: targetMeal.mealType, alreadySelectedNames: new Set(), leftoverIngredients: new Set() });
            const bestFood = ranked[0].food;
            const scale = targetMeal.calories / bestFood.calories;
            const newQty = Math.round(bestFood.servingSize * scale * 10) / 10;
            await this.repository.updateMeal(dto.mealId, {
                foodId: bestFood.id,
                quantity: newQty,
                unit: bestFood.defaultUnit,
                calories: targetMeal.calories,
                protein: Math.round(bestFood.protein * scale * 10) / 10,
                carbs: Math.round(bestFood.carbohydrates * scale * 10) / 10,
                fats: Math.round(bestFood.fats * scale * 10) / 10,
                notes: `Regenerated meal slot`,
                status: 'replaced',
            });
        }
        else if (dto.dayId) {
            const dayRecord = plan.days.find((d) => d.id === dto.dayId);
            if (!dayRecord)
                throw new common_1.NotFoundException('Plan day not found');
            for (const m of dayRecord.meals) {
                const ranked = this.selectionEngine.rankFoods(catalogFoods, { goal: plan.goal }, { mealType: m.mealType, alreadySelectedNames: new Set(), leftoverIngredients: new Set() });
                const bestFood = ranked[Math.floor(Math.random() * 2) % ranked.length].food;
                const scale = m.calories / bestFood.calories;
                const newQty = Math.round(bestFood.servingSize * scale * 10) / 10;
                await this.repository.updateMeal(m.id, {
                    foodId: bestFood.id,
                    quantity: newQty,
                    unit: bestFood.defaultUnit,
                    calories: m.calories,
                    protein: Math.round(bestFood.protein * scale * 10) / 10,
                    carbs: Math.round(bestFood.carbohydrates * scale * 10) / 10,
                    fats: Math.round(bestFood.fats * scale * 10) / 10,
                    notes: `Regenerated day slot`,
                    status: 'replaced',
                });
            }
        }
        await this.repository.incrementRegens(dto.planId);
        await this.repository.logInteraction(userId, {
            planId: dto.planId,
            interactionType: 'regenerated_meal',
        });
        return this.getPlan(dto.planId);
    }
    async completeMeal(userId, mealId) {
        const planMeal = await this.prisma.mealPlanMeal.findUnique({
            where: { id: mealId },
            include: {
                mealPlanDay: {
                    include: {
                        mealPlan: true,
                    },
                },
                food: true,
            },
        });
        if (!planMeal)
            throw new common_1.NotFoundException('Planned meal not found');
        const mealRecord = await this.mealsService.createMeal(userId, {
            mealType: planMeal.mealType,
            source: 'planner',
            items: [
                {
                    foodName: planMeal.food?.name || 'Meal Item',
                    quantity: planMeal.quantity,
                    unit: planMeal.unit,
                    calories: planMeal.calories,
                    protein: planMeal.protein,
                    carbohydrates: planMeal.carbs,
                    fats: planMeal.fats,
                    fiber: planMeal.food?.fiber || 0,
                    sugar: planMeal.food?.sugar || 0,
                    foodId: planMeal.foodId,
                },
            ],
        });
        await this.repository.updateMeal(mealId, {
            status: 'completed',
            completedAt: new Date(),
            loggedMealId: mealRecord.id,
        });
        await this.repository.logInteraction(userId, {
            planId: planMeal.mealPlanDay.mealPlan.id,
            mealId,
            interactionType: 'completed_meal',
        });
        return { success: true, loggedMealId: mealRecord.id };
    }
    async skipMeal(userId, mealId) {
        const planMeal = await this.prisma.mealPlanMeal.findUnique({
            where: { id: mealId },
            include: { mealPlanDay: { include: { mealPlan: true } } },
        });
        if (!planMeal)
            throw new common_1.NotFoundException('Planned meal not found');
        await this.repository.updateMeal(mealId, {
            status: 'skipped',
        });
        await this.repository.logInteraction(userId, {
            planId: planMeal.mealPlanDay.mealPlan.id,
            mealId,
            interactionType: 'skipped_meal',
        });
        return { success: true };
    }
    async savePlanAsTemplate(userId, dto) {
        const plan = await this.repository.findPlan(dto.planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        const planData = JSON.stringify(plan);
        return this.repository.saveTemplate(userId, dto.title, dto.description, planData);
    }
    async getTemplates(userId) {
        return this.repository.findTemplates(userId);
    }
    async deleteTemplate(id) {
        await this.repository.deleteTemplate(id);
        return { success: true };
    }
    async getShoppingList(planId) {
        const plan = await this.repository.findPlan(planId);
        if (!plan)
            throw new common_1.NotFoundException('Meal plan not found');
        const ingredientsMap = {};
        for (const d of plan.days) {
            for (const m of d.meals) {
                const key = m.foodId || m.food?.name || m.notes || 'Other';
                const foodPrice = m.food?.averagePrice || 1.5;
                if (ingredientsMap[key]) {
                    ingredientsMap[key].quantity += m.quantity;
                    ingredientsMap[key].estimatedCost += Math.round(m.quantity / 100 * foodPrice * 100) / 100;
                }
                else {
                    ingredientsMap[key] = {
                        foodId: m.foodId,
                        name: m.food?.name || m.notes || 'Ingredient',
                        quantity: m.quantity,
                        unit: m.unit,
                        estimatedCost: Math.round(m.quantity / 100 * foodPrice * 100) / 100,
                    };
                }
            }
        }
        const categories = {
            dairy: [],
            vegetables: [],
            fruits: [],
            grains: [],
            meat: [],
            spices: [],
            supplements: [],
            other: [],
        };
        let totalCost = 0;
        for (const key of Object.keys(ingredientsMap)) {
            const ing = ingredientsMap[key];
            totalCost += ing.estimatedCost;
            const nameLower = ing.name.toLowerCase();
            let cat = 'other';
            if (['milk', 'cheese', 'paneer', 'yogurt', 'curd', 'butter'].some((x) => nameLower.includes(x))) {
                cat = 'dairy';
            }
            else if (['chicken', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton', 'fish', 'tuna'].some((x) => nameLower.includes(x))) {
                cat = 'meat';
            }
            else if (['rice', 'oats', 'wheat', 'bread', 'roti', 'grains', 'quinoa'].some((x) => nameLower.includes(x))) {
                cat = 'grains';
            }
            else if (['broccoli', 'spinach', 'cucumber', 'vegetables', 'carrot', 'onion', 'garlic', 'tomato'].some((x) => nameLower.includes(x))) {
                cat = 'vegetables';
            }
            else if (['apple', 'banana', 'orange', 'fruit', 'berry', 'berries', 'strawberries'].some((x) => nameLower.includes(x))) {
                cat = 'fruits';
            }
            else if (['creatine', 'protein', 'supplement', 'vitamins'].some((x) => nameLower.includes(x))) {
                cat = 'supplements';
            }
            else if (['pepper', 'salt', 'spice', 'turmeric', 'chili', 'cardamom'].some((x) => nameLower.includes(x))) {
                cat = 'spices';
            }
            categories[cat].push({
                id: 'shop-' + Math.random().toString(36).substr(2, 9),
                foodId: ing.foodId,
                name: ing.name,
                quantity: Math.round(ing.quantity),
                unit: ing.unit,
                checked: false,
                purchased: false,
                estimatedCost: Math.round(ing.estimatedCost * 100) / 100,
                pantryDeduction: 0,
            });
        }
        return {
            planId,
            categories,
            totalCost: Math.round(totalCost * 100) / 100,
            currency: 'USD',
        };
    }
    async getAdherenceAnalytics(userId) {
        const plans = await this.repository.findUserPlans(userId);
        const activePlan = plans.find((p) => p.status === 'active');
        if (!activePlan) {
            return {
                adherencePercentage: 0,
                skippedMeals: 0,
                completedMeals: 0,
                regeneratedMeals: 0,
                replacedMeals: 0,
                averageProteinAchievement: 0,
                calorieAdherence: 0,
                weeklyCompletion: 0,
                monthlyCompletion: 0,
            };
        }
        const fullPlan = await this.repository.findPlan(activePlan.id);
        if (!fullPlan)
            throw new common_1.NotFoundException('Active plan details missing');
        let plannedCount = 0;
        let completedCount = 0;
        let skippedCount = 0;
        for (const d of fullPlan.days) {
            for (const m of d.meals) {
                plannedCount++;
                if (m.status === 'completed')
                    completedCount++;
                else if (m.status === 'skipped')
                    skippedCount++;
            }
        }
        const adherencePercentage = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;
        const recentMeals = await this.prisma.meal.findMany({
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: { items: true },
        });
        let loggedProtein = 0;
        let loggedCalories = 0;
        for (const m of recentMeals) {
            for (const i of m.items) {
                loggedProtein += i.protein;
                loggedCalories += i.calories;
            }
        }
        const avgDailyProtein = recentMeals.length > 0 ? Math.round(loggedProtein / 7) : 0;
        const avgDailyCalories = recentMeals.length > 0 ? Math.round(loggedCalories / 7) : 0;
        return {
            adherencePercentage,
            skippedMeals: skippedCount,
            completedMeals: completedCount,
            regeneratedMeals: fullPlan.regenerationsCount,
            replacedMeals: fullPlan.replacementsCount,
            averageProteinAchievement: Math.min(100, Math.round(avgDailyProtein / activePlan.proteinTarget * 100)),
            calorieAdherence: Math.min(100, Math.round(avgDailyCalories / activePlan.caloriesTarget * 100)),
            weeklyCompletion: adherencePercentage,
            monthlyCompletion: Math.min(100, Math.round(adherencePercentage * 0.9)),
        };
    }
};
exports.MealPlannerService = MealPlannerService;
exports.MealPlannerService = MealPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meal_plan_repository_1.MealPlanRepository,
        pantry_repository_1.PantryRepository,
        meal_plan_generator_1.MealPlanPlanGenerator,
        food_selection_engine_1.FoodSelectionEngine,
        users_service_1.UsersService,
        meals_service_1.MealsService,
        prisma_service_1.PrismaService])
], MealPlannerService);
exports.default = MealPlannerService;
//# sourceMappingURL=meal-planner.service.js.map