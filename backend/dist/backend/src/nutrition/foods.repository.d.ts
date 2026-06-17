import { PrismaService } from '../prisma/prisma.service';
export declare class FoodsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(query: string): Promise<{
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
    }[]>;
    create(data: any): Promise<{
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
    }>;
    findByName(name: string): Promise<{
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
    }>;
}
