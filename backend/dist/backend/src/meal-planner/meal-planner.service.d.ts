import { MealPlanRepository } from './meal-plan.repository';
import { PantryRepository } from './pantry.repository';
import { MealPlanPlanGenerator } from './meal-plan.generator';
import { FoodSelectionEngine } from './food-selection.engine';
import { UsersService } from '../users/users.service';
import { MealsService } from '../meals/meals.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateMealPlanRequest, ReplaceMealRequest, ReplaceIngredientRequest, RegenerateMealRequest, SaveTemplateRequest } from '../../../shared/contracts';
export declare class MealPlannerService {
    private readonly repository;
    private readonly pantryRepository;
    private readonly generator;
    private readonly selectionEngine;
    private readonly usersService;
    private readonly mealsService;
    private readonly prisma;
    constructor(repository: MealPlanRepository, pantryRepository: PantryRepository, generator: MealPlanPlanGenerator, selectionEngine: FoodSelectionEngine, usersService: UsersService, mealsService: MealsService, prisma: PrismaService);
    generatePlan(userId: string, dto: GenerateMealPlanRequest): Promise<{
        days: ({
            meals: ({
                food: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    source: import("src/generated/prisma").$Enums.FoodSource;
                    calories: number;
                    protein: number;
                    carbohydrates: number;
                    fats: number;
                    fiber: number;
                    sugar: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                foodId: string | null;
                status: string;
                mealPlanDayId: string;
                carbs: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            dayOfWeek: string;
            mealPlanId: string;
        })[];
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    getPlans(userId: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }[]>;
    getPlan(id: string): Promise<{
        days: ({
            meals: ({
                food: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    source: import("src/generated/prisma").$Enums.FoodSource;
                    calories: number;
                    protein: number;
                    carbohydrates: number;
                    fats: number;
                    fiber: number;
                    sugar: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                foodId: string | null;
                status: string;
                mealPlanDayId: string;
                carbs: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            dayOfWeek: string;
            mealPlanId: string;
        })[];
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    deletePlan(id: string): Promise<{
        success: boolean;
    }>;
    updatePlanTitle(id: string, title: string): Promise<{
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    activatePlan(userId: string, planId: string): Promise<{
        success: boolean;
        planId: string;
    }>;
    replaceMeal(userId: string, dto: ReplaceMealRequest): Promise<{
        days: ({
            meals: ({
                food: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    source: import("src/generated/prisma").$Enums.FoodSource;
                    calories: number;
                    protein: number;
                    carbohydrates: number;
                    fats: number;
                    fiber: number;
                    sugar: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                foodId: string | null;
                status: string;
                mealPlanDayId: string;
                carbs: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            dayOfWeek: string;
            mealPlanId: string;
        })[];
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    replaceIngredient(userId: string, dto: ReplaceIngredientRequest): Promise<{
        days: ({
            meals: ({
                food: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    source: import("src/generated/prisma").$Enums.FoodSource;
                    calories: number;
                    protein: number;
                    carbohydrates: number;
                    fats: number;
                    fiber: number;
                    sugar: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                foodId: string | null;
                status: string;
                mealPlanDayId: string;
                carbs: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            dayOfWeek: string;
            mealPlanId: string;
        })[];
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    regeneratePart(userId: string, dto: RegenerateMealRequest): Promise<{
        days: ({
            meals: ({
                food: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    source: import("src/generated/prisma").$Enums.FoodSource;
                    calories: number;
                    protein: number;
                    carbohydrates: number;
                    fats: number;
                    fiber: number;
                    sugar: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                foodId: string | null;
                status: string;
                mealPlanDayId: string;
                carbs: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            dayOfWeek: string;
            mealPlanId: string;
        })[];
    } & {
        type: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        goal: string;
        userId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    completeMeal(userId: string, mealId: string): Promise<{
        success: boolean;
        loggedMealId: string;
    }>;
    skipMeal(userId: string, mealId: string): Promise<{
        success: boolean;
    }>;
    savePlanAsTemplate(userId: string, dto: SaveTemplateRequest): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        planData: string;
    }>;
    getTemplates(userId: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        planData: string;
    }[]>;
    deleteTemplate(id: string): Promise<{
        success: boolean;
    }>;
    getShoppingList(planId: string): Promise<{
        planId: string;
        categories: Record<string, any[]>;
        totalCost: number;
        currency: string;
    }>;
    getAdherenceAnalytics(userId: string): Promise<{
        adherencePercentage: number;
        skippedMeals: number;
        completedMeals: number;
        regeneratedMeals: number;
        replacedMeals: number;
        averageProteinAchievement: number;
        calorieAdherence: number;
        weeklyCompletion: number;
        monthlyCompletion: number;
    }>;
}
export default MealPlannerService;
