import { PrismaService } from '../prisma/prisma.service';
export declare class PantryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserPantry(userId: string): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        unit: string;
        foodId: string;
        expiryDate: Date | null;
    })[]>;
    upsertItem(userId: string, data: {
        foodId: string;
        quantity: number;
        unit: string;
        expiryDate?: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        unit: string;
        foodId: string;
        expiryDate: Date | null;
    }>;
    deleteItem(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        unit: string;
        foodId: string;
        expiryDate: Date | null;
    }>;
    updateQuantity(id: string, qty: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        unit: string;
        foodId: string;
        expiryDate: Date | null;
    }>;
}
export default PantryRepository;
