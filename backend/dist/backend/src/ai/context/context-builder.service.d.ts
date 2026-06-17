import { ProfileRetriever } from '../retrievers/profile.retriever';
import { NutritionRetriever } from '../retrievers/nutrition.retriever';
import { MealHistoryRetriever } from '../retrievers/meal-history.retriever';
import { ExerciseRetriever } from '../retrievers/exercise.retriever';
import { TravelRetriever } from '../retrievers/travel.retriever';
import { AnalyticsRetriever } from '../retrievers/analytics.retriever';
import { NotificationsRetriever } from '../retrievers/notifications.retriever';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ContextBuilderService {
    private readonly profileRetriever;
    private readonly nutritionRetriever;
    private readonly mealHistoryRetriever;
    private readonly exerciseRetriever;
    private readonly travelRetriever;
    private readonly analyticsRetriever;
    private readonly notificationsRetriever;
    private readonly prisma;
    constructor(profileRetriever: ProfileRetriever, nutritionRetriever: NutritionRetriever, mealHistoryRetriever: MealHistoryRetriever, exerciseRetriever: ExerciseRetriever, travelRetriever: TravelRetriever, analyticsRetriever: AnalyticsRetriever, notificationsRetriever: NotificationsRetriever, prisma: PrismaService);
    buildContext(userId: string): Promise<{
        profile: {
            fullName: string;
            age: number;
            gender: string;
            weight: number;
            height: number;
            activityLevel: string;
            goal: string;
        };
        nutrition: {
            calorieTarget: number;
            proteinTarget: number;
            carbsTarget: number;
            fatTarget: number;
            waterTarget: number;
            todayMacros: {
                calories: number;
                protein: number;
                carbohydrates: number;
                fats: number;
            };
            hydration: {
                current: number;
                target: number;
                status: string;
            };
            calorieBalance: number;
            exerciseBurn: number;
        };
        meals: {
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
        };
        exercise: {
            recentWorkouts: {
                activity: string;
                duration: number;
                burned: number;
                date: string;
            }[];
            recentWorkoutsCount: number;
            totalCaloriesBurned: number;
        };
        travel: {
            active: boolean;
            destination: string;
            timezone: string;
            purpose: string;
            startDate: Date;
            liveSurplus: any;
            hasRecoveryPlan: boolean;
            recoveryPlan: {
                totalSurplusCalories: number;
                dailyReductionCalories: number;
                recoveryDays: number;
                currentDayNumber: number;
                percentage: number;
                status: string;
                todayTarget: import("../../../../shared/contracts").RecoveryDayResponse;
            };
        };
        analytics: {
            healthScore: number;
            consistencyScore: number;
            adherenceScore: number;
            currentStreak: number;
            weightPrediction30Days: number;
            recommendations: string[];
            insights: string[];
            riskAlerts: string[];
            weightTrend: string;
        };
        notifications: {
            habitWeeklyScore: number;
            habitMonthlyScore: number;
            habitInsights: string[];
            activeReminders: string[];
            strongestHabit: {
                name: string;
                streak: number;
            };
            weakestHabit: {
                name: string;
                rate: number;
            };
        };
        recentScans: {
            id: string;
            model: string;
            confidence: number;
            status: string;
            createdAt: string;
        }[];
    }>;
}
export default ContextBuilderService;
