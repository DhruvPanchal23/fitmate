import { PrismaService } from '../../prisma/prisma.service';
export declare class ExerciseRetriever {
    private readonly prisma;
    constructor(prisma: PrismaService);
    retrieve(userId: string): Promise<{
        recentWorkouts: {
            activity: string;
            duration: number;
            burned: number;
            date: string;
        }[];
        recentWorkoutsCount: number;
        totalCaloriesBurned: number;
    }>;
}
