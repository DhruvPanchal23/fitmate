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
const travel_service_1 = require("../travel/travel.service");
const memory_service_1 = require("../ai/memory/memory.service");
const meal_plan_templates_service_1 = require("./meal-plan-templates.service");
const meal_plan_shopping_service_1 = require("./meal-plan-shopping.service");
const meal_plan_analytics_service_1 = require("./meal-plan-analytics.service");
let MealPlannerService = class MealPlannerService {
    constructor(repository, pantryRepository, generator, selectionEngine, usersService, mealsService, prisma, travelService, memoryService, templatesService, shoppingService, analyticsService) {
        this.repository = repository;
        this.pantryRepository = pantryRepository;
        this.generator = generator;
        this.selectionEngine = selectionEngine;
        this.usersService = usersService;
        this.mealsService = mealsService;
        this.prisma = prisma;
        this.travelService = travelService;
        this.memoryService = memoryService;
        this.templatesService = templatesService;
        this.shoppingService = shoppingService;
        this.analyticsService = analyticsService;
    }
    async generatePlan(userId, dto) {
        const profile = await this.usersService.getProfile(userId);
        if (!profile) {
            throw new common_1.BadRequestException('User profile must exist to generate plans');
        }
        const recovery = await this.travelService.getRecoveryPlan(userId);
        const hasRecoveryPlan = !!recovery && recovery.plan.status === 'active';
        let calTarget = 2200;
        let protTarget = 150;
        let carbsTarget = 200;
        let fatTarget = 70;
        if (hasRecoveryPlan && recovery.todayTarget) {
            calTarget = recovery.todayTarget.caloriesTarget;
            protTarget = recovery.todayTarget.proteinTarget;
            carbsTarget = recovery.todayTarget.carbsTarget;
            fatTarget = recovery.todayTarget.fatsTarget;
        }
        else if (profile.goal === 'fat_loss') {
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
        const memories = await this.memoryService.getMemories(userId);
        const activeMemories = memories.filter(m => !m.isIgnored);
        const favoriteFoods = activeMemories
            .filter(m => m.category === 'favorite_foods')
            .map(m => m.content.replace(/Prefers\s+/i, ''));
        const memoryAllergies = activeMemories
            .filter(m => m.category === 'allergies')
            .map(m => m.content.replace(/Allergic to\s+/i, ''));
        const combinedAllergies = Array.from(new Set([
            ...(dto.allergies || []),
            ...memoryAllergies
        ]));
        const genCtx = {
            userId,
            type: dto.type,
            goal: dto.goal,
            caloriesTarget: calTarget,
            proteinTarget: protTarget,
            carbsTarget: carbsTarget,
            fatTarget: fatTarget,
            dietaryPreference: dto.dietaryPreference || 'none',
            allergies: combinedAllergies,
            budgetPreference: dto.budgetPreference || 'medium',
            favoriteFoods,
            pantryItems: pantryArgs,
            recoveryActive: hasRecoveryPlan,
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
        return this.templatesService.savePlanAsTemplate(userId, dto);
    }
    async getTemplates(userId) {
        return this.templatesService.getTemplates(userId);
    }
    async deleteTemplate(id) {
        return this.templatesService.deleteTemplate(id);
    }
    async getShoppingList(planId) {
        return this.shoppingService.getShoppingList(planId);
    }
    async getAdherenceAnalytics(userId) {
        return this.analyticsService.getAdherenceAnalytics(userId);
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
        prisma_service_1.PrismaService,
        travel_service_1.TravelService,
        memory_service_1.MemoryService,
        meal_plan_templates_service_1.MealPlanTemplatesService,
        meal_plan_shopping_service_1.MealPlanShoppingService,
        meal_plan_analytics_service_1.MealPlanAnalyticsService])
], MealPlannerService);
exports.default = MealPlannerService;
//# sourceMappingURL=meal-planner.service.js.map