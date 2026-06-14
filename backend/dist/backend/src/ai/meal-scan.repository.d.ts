import { PrismaService } from '../prisma/prisma.service';
export declare class MealScanRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        imageUrl: string;
        model: string;
        confidence: number;
        rawResponse: string;
        processedMatches: string;
        status: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mealId: string | null;
        imageUrl: string;
        model: string;
        confidence: number;
        rawResponse: string;
        processedMatches: string;
        status: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mealId: string | null;
        imageUrl: string;
        model: string;
        confidence: number;
        rawResponse: string;
        processedMatches: string;
        status: string;
    }>;
    update(id: string, data: {
        status?: string;
        mealId?: string;
        processedMatches?: string;
        confidence?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mealId: string | null;
        imageUrl: string;
        model: string;
        confidence: number;
        rawResponse: string;
        processedMatches: string;
        status: string;
    } | {
        status?: string;
        mealId?: string;
        processedMatches?: string;
        confidence?: number;
        id: string;
    }>;
}
