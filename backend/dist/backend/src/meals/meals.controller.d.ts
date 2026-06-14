import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
export declare class MealsController {
    private readonly mealsService;
    constructor(mealsService: MealsService);
    createMeal(req: any, dto: CreateMealDto): Promise<{
        id: string;
        userId: string;
        mealType: string;
        source: string;
        createdAt: Date;
        items: {
            foodName: string;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            carbohydrates: number;
            fats: number;
            fiber: number;
            sugar: number;
            id: string;
            mealId: string;
        }[];
    }>;
    getMeals(req: any): Promise<({
        items: {
            id: string;
            foodName: string;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            carbohydrates: number;
            fats: number;
            fiber: number;
            sugar: number;
            foodId: string | null;
            mealId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        mealType: string;
        source: string;
    })[]>;
    deleteMeal(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        mealType: string;
        source: string;
    } | {
        id: string;
    }>;
}
