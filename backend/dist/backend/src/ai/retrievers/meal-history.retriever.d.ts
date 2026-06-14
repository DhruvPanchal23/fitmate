import { PrismaService } from '../../prisma/prisma.service';
export declare class MealHistoryRetriever {
    private readonly prisma;
    constructor(prisma: PrismaService);
    retrieve(userId: string): Promise<{
        todayMeals: {
            type: string;
            source: string;
            items: {
                name: string;
                calories: number;
                qty: number;
                unit: string;
            }[];
        }[];
        recentHistoryCount: number;
        recentMealsSummary: {
            type: string;
            date: string;
            items: string[];
        }[];
        favoriteFoods: string[];
        streak: number;
    }>;
    private calculateStreak;
}
