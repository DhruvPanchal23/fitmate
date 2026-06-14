import { PrismaService } from '../prisma/prisma.service';
import { CreateMealRequest } from '../../../shared/contracts';
export declare class MealsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMealRequest): Promise<{
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
    findMany(userId: string, dateStr?: string): Promise<({
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
    findOne(id: string): Promise<{
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
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        mealType: string;
        source: string;
    } | {
        id: string;
    }>;
}
