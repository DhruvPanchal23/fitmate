import { TravelRepository } from './travel.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SurplusCalculator } from './engines/surplus-calculator';
import { CompensationEngine } from './engines/compensation-engine';
import { RecoveryPlanner } from './engines/recovery-planner';
import { TravelAnalyticsService } from './travel-analytics.service';
import { StartTravelRequest } from '../../../shared/contracts/travel-compensation';
export declare class TravelService {
    private readonly repository;
    private readonly prisma;
    private readonly surplusCalculator;
    private readonly compensationEngine;
    private readonly recoveryPlanner;
    private readonly analyticsService;
    constructor(repository: TravelRepository, prisma: PrismaService, surplusCalculator: SurplusCalculator, compensationEngine: CompensationEngine, recoveryPlanner: RecoveryPlanner, analyticsService: TravelAnalyticsService);
    startTravel(userId: string, request: StartTravelRequest): Promise<{
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
    endTravel(userId: string): Promise<{
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
    getActiveSession(userId: string): Promise<{
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
    getHistory(userId: string): Promise<{
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
    getAnalytics(userId: string, sessionId?: string): Promise<import("../../../shared/contracts/travel-compensation").TravelAnalyticsResponse>;
    getRecoveryPlan(userId: string): Promise<{
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
        schedule: import("../../../shared/contracts/travel-compensation").RecoveryDayResponse[];
        currentDayNumber: number;
        percentage: number;
        todayTarget: import("../../../shared/contracts/travel-compensation").RecoveryDayResponse;
    }>;
    updateRecoveryStatus(userId: string, planId: string, status: string): Promise<{
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
    private calculateDailySummaries;
    private liveCalculateActiveSummaries;
    private fetchTargetGoals;
    private gatherLogsAndCalculate;
    toggleTravelMode(userId: string, active: boolean): Promise<{
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
    getTravelStats(userId: string): Promise<{
        streak: number;
        activeDays: number;
        waterTotal: number;
        scannedMealsCount: number;
    }>;
}
export default TravelService;
