import { TravelService } from './travel.service';
import { ToggleTravelModeRequest, StartTravelRequest } from '../../../shared/contracts';
export declare class TravelController {
    private readonly travelService;
    constructor(travelService: TravelService);
    toggleTravel(req: any, body: ToggleTravelModeRequest): Promise<{
        success: boolean;
        active: boolean;
        session: {
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
        result?: undefined;
    } | {
        success: boolean;
        active: boolean;
        session?: undefined;
        result?: undefined;
    } | {
        success: boolean;
        active: boolean;
        result: {
            session: {
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
            };
            plan: {
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
            compensation: {
                totalSurplusCalories: number;
                dailyReductionCalories: number;
                recoveryDays: number;
                recoveryCalorieTarget: number;
                proteinTarget: number;
                carbsTarget: number;
                fatsTarget: number;
                waterTarget: number;
                recommendedSteps: number;
                recommendedWalkingMinutes: number;
                recommendedCardioMinutes: number;
                recommendedStrengthSessions: number;
            };
        };
        session?: undefined;
    }>;
    getStats(req: any): Promise<{
        streak: number;
        activeDays: number;
        waterTotal: number;
        scannedMealsCount: number;
    }>;
    startTravel(req: any, body: StartTravelRequest): Promise<{
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
    endTravel(req: any): Promise<{
        session: {
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
        };
        plan: {
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
        compensation: {
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            recoveryCalorieTarget: number;
            proteinTarget: number;
            carbsTarget: number;
            fatsTarget: number;
            waterTarget: number;
            recommendedSteps: number;
            recommendedWalkingMinutes: number;
            recommendedCardioMinutes: number;
            recommendedStrengthSessions: number;
        };
    }>;
    getCurrentSession(req: any): Promise<{
        liveSurplus: any;
        dailySummaries: any[];
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
    getHistory(req: any): Promise<{
        id: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        active: boolean;
        purpose: string;
        totalSurplus: number;
        days: number;
        compensationStatus: string;
    }[]>;
    getAnalytics(req: any, sessionId?: string): Promise<import("../../../shared/contracts").TravelAnalyticsResponse>;
    getRecovery(req: any): Promise<{
        plan: {
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
        };
        schedule: import("../../../shared/contracts").RecoveryDayResponse[];
        currentDayNumber: number;
        percentage: number;
        todayTarget: import("../../../shared/contracts").RecoveryDayResponse;
    }>;
    updateRecoveryStatus(req: any, body: {
        planId: string;
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
}
export default TravelController;
