import { ExerciseRepository } from './exercise.repository';
import { LogExerciseRequest } from '../../../shared/contracts';
export declare class ExerciseService {
    private readonly repository;
    constructor(repository: ExerciseRepository);
    logExercise(userId: string, dto: LogExerciseRequest): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        activityName: string;
        durationMinutes: number;
        caloriesBurned: number;
    }>;
    getExerciseLogs(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        activityName: string;
        durationMinutes: number;
        caloriesBurned: number;
    }[]>;
}
