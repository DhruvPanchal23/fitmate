import { MealsRepository } from './meals.repository';
import { CreateMealRequest } from '../../../shared/contracts';
export declare class MealsService {
    private readonly repository;
    constructor(repository: MealsRepository);
    createMeal(userId: string, dto: CreateMealRequest): Promise<{
        id: string;
        userId: string;
        mealType: string;
        source: string;
        createdAt: Date;
        items: {
            foodId?: string;
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
    getMeals(userId: string, dateStr?: string): Promise<({
        items: {
            id: string;
            mealId: string;
            foodId: string | null;
            quantity: number;
            unit: string;
            calories: number;
            protein: number;
            fats: number;
            fiber: number;
            sugar: number;
            carbohydrates: number;
            foodName: string;
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
