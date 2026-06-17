import { PrismaService } from '../prisma/prisma.service';
export declare class TravelRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActiveSession(userId: string): Promise<{
        dailySummaries: {
            id: string;
            protein: number;
            carbs: number;
            fats: number;
            caloriesTarget: number;
            travelSessionId: string;
            water: number;
            date: Date;
            caloriesConsumed: number;
            steps: number;
            surplus: number;
            exerciseCalories: number;
        }[];
        compensationPlan: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            travelSessionId: string;
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            recommendedWalkingMinutes: number;
            recommendedCardioMinutes: number;
            recommendedStrengthSessions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        timezone: string | null;
        active: boolean;
        destination: string | null;
        purpose: string | null;
    }>;
    findSessionById(sessionId: string): Promise<{
        dailySummaries: {
            id: string;
            protein: number;
            carbs: number;
            fats: number;
            caloriesTarget: number;
            travelSessionId: string;
            water: number;
            date: Date;
            caloriesConsumed: number;
            steps: number;
            surplus: number;
            exerciseCalories: number;
        }[];
        compensationPlan: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            travelSessionId: string;
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            recommendedWalkingMinutes: number;
            recommendedCardioMinutes: number;
            recommendedStrengthSessions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        timezone: string | null;
        active: boolean;
        destination: string | null;
        purpose: string | null;
    }>;
    createSession(userId: string, destination?: string, timezone?: string, purpose?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        timezone: string | null;
        active: boolean;
        destination: string | null;
        purpose: string | null;
    }>;
    deactivateSessions(userId: string): Promise<{
        dailySummaries: {
            id: string;
            protein: number;
            carbs: number;
            fats: number;
            caloriesTarget: number;
            travelSessionId: string;
            water: number;
            date: Date;
            caloriesConsumed: number;
            steps: number;
            surplus: number;
            exerciseCalories: number;
        }[];
        compensationPlan: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            travelSessionId: string;
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            recommendedWalkingMinutes: number;
            recommendedCardioMinutes: number;
            recommendedStrengthSessions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        timezone: string | null;
        active: boolean;
        destination: string | null;
        purpose: string | null;
    }>;
    findMany(userId: string): Promise<({
        dailySummaries: {
            id: string;
            protein: number;
            carbs: number;
            fats: number;
            caloriesTarget: number;
            travelSessionId: string;
            water: number;
            date: Date;
            caloriesConsumed: number;
            steps: number;
            surplus: number;
            exerciseCalories: number;
        }[];
        compensationPlan: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            travelSessionId: string;
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            recommendedWalkingMinutes: number;
            recommendedCardioMinutes: number;
            recommendedStrengthSessions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        timezone: string | null;
        active: boolean;
        destination: string | null;
        purpose: string | null;
    })[]>;
    saveDailySummary(data: {
        travelSessionId: string;
        date: Date;
        caloriesConsumed: number;
        caloriesTarget: number;
        surplus: number;
        protein: number;
        carbs: number;
        fats: number;
        water: number;
        exerciseCalories: number;
        steps: number;
    }): Promise<{
        id: string;
        protein: number;
        carbs: number;
        fats: number;
        caloriesTarget: number;
        travelSessionId: string;
        water: number;
        date: Date;
        caloriesConsumed: number;
        steps: number;
        surplus: number;
        exerciseCalories: number;
    }>;
    saveCompensationPlan(data: {
        userId: string;
        travelSessionId: string;
        totalSurplusCalories: number;
        dailyReductionCalories: number;
        recoveryDays: number;
        recommendedWalkingMinutes: number;
        recommendedCardioMinutes: number;
        recommendedStrengthSessions: number;
        status: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        travelSessionId: string;
        totalSurplusCalories: number;
        dailyReductionCalories: number;
        recoveryDays: number;
        recommendedWalkingMinutes: number;
        recommendedCardioMinutes: number;
        recommendedStrengthSessions: number;
    }>;
    findActiveCompensationPlan(userId: string): Promise<{
        travelSession: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            startDate: Date;
            endDate: Date | null;
            timezone: string | null;
            active: boolean;
            destination: string | null;
            purpose: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        travelSessionId: string;
        totalSurplusCalories: number;
        dailyReductionCalories: number;
        recoveryDays: number;
        recommendedWalkingMinutes: number;
        recommendedCardioMinutes: number;
        recommendedStrengthSessions: number;
    }>;
    updateCompensationPlanStatus(planId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        travelSessionId: string;
        totalSurplusCalories: number;
        dailyReductionCalories: number;
        recoveryDays: number;
        recommendedWalkingMinutes: number;
        recommendedCardioMinutes: number;
        recommendedStrengthSessions: number;
    }>;
}
export default TravelRepository;
