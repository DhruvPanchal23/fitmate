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
                    fats: number;
                    fiber: number;
                    sugar: number;
                    carbohydrates: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                status: string;
                mealPlanDayId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            mealPlanId: string;
            dayOfWeek: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    getPlans(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
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
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        description: string | null;
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
                    fats: number;
                    fiber: number;
                    sugar: number;
                    carbohydrates: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                status: string;
                mealPlanDayId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            mealPlanId: string;
            dayOfWeek: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
        timezone: string | null;
        regenerationsCount: number;
        replacementsCount: number;
    }>;
    updatePlan(id: string, body: UpdateTitleRequest): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
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
                    fats: number;
                    fiber: number;
                    sugar: number;
                    carbohydrates: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                status: string;
                mealPlanDayId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            mealPlanId: string;
            dayOfWeek: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
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
                    fats: number;
                    fiber: number;
                    sugar: number;
                    carbohydrates: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                status: string;
                mealPlanDayId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            mealPlanId: string;
            dayOfWeek: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
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
                    fats: number;
                    fiber: number;
                    sugar: number;
                    carbohydrates: number;
                    defaultUnit: string;
                    servingSize: number;
                    averagePrice: number | null;
                    currency: string | null;
                };
            } & {
                id: string;
                mealType: string;
                status: string;
                mealPlanDayId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                notes: string | null;
                completedAt: Date | null;
                loggedMealId: string | null;
            })[];
        } & {
            id: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            mealPlanId: string;
            dayOfWeek: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        title: string;
        type: string;
        goal: string;
        caloriesTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatTarget: number;
        version: number;
        parentPlanId: string | null;
        startDate: Date | null;
        endDate: Date | null;
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
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        description: string | null;
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
