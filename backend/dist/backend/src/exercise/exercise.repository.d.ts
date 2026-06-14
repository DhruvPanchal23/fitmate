import { PrismaService } from '../prisma/prisma.service';
import { LogExerciseRequest } from '../../../shared/contracts';
export declare class ExerciseRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: LogExerciseRequest): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        activityName: string;
        durationMinutes: number;
        caloriesBurned: number;
    }>;
    findMany(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        activityName: string;
        durationMinutes: number;
        caloriesBurned: number;
    }[]>;
}
