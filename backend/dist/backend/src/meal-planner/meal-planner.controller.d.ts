import { MealPlannerService } from './meal-planner.service';
import { GenerateMealPlanRequest, ReplaceMealRequest, ReplaceIngredientRequest, RegenerateMealRequest, SaveTemplateRequest, UpdateTitleRequest } from '../../../shared/contracts';
export declare class MealPlannerController {
    private readonly plannerService;
    constructor(plannerService: MealPlannerService);
    generate(req: any, dto: GenerateMealPlanRequest): Promise<{
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
    getPlans(req: any): Promise<{
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
    getAnalytics(req: any): Promise<{
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
    getTemplates(req: any): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        planData: string;
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
    updatePlan(id: string, body: UpdateTitleRequest): Promise<{
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
    regenerate(req: any, dto: RegenerateMealRequest): Promise<{
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
    replaceMeal(req: any, dto: ReplaceMealRequest): Promise<{
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
    replaceIngredient(req: any, dto: ReplaceIngredientRequest): Promise<{
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
    activate(req: any, body: {
        planId: string;
    }): Promise<{
        success: boolean;
        planId: string;
    }>;
    saveTemplate(req: any, dto: SaveTemplateRequest): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        planData: string;
    }>;
    deleteTemplate(id: string): Promise<{
        success: boolean;
    }>;
    getShoppingList(id: string): Promise<{
        planId: string;
        categories: Record<string, any[]>;
        totalCost: number;
        currency: string;
    }>;
    completeMeal(req: any, id: string): Promise<{
        success: boolean;
        loggedMealId: string;
    }>;
    skipMeal(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
export default MealPlannerController;
