import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { SecurityScoreService } from './services/security-score.service';
export declare class UsersController {
    private readonly usersService;
    private readonly securityScoreService;
    constructor(usersService: UsersService, securityScoreService: SecurityScoreService);
    getProfile(req: any): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        goal: string;
        version: number;
        fullName: string;
        gender: string;
        birthDate: Date | null;
        age: number;
        height: number;
        weight: number;
        targetWeight: number | null;
        bodyFatPercentage: number | null;
        activityLevel: string;
        dietPreference: string | null;
        allergies: string[];
        dislikedFoods: string[];
        preferredFoods: string[];
        gymExperience: string | null;
        workoutDays: number | null;
        sleepHours: number | null;
        wakeUpTime: string | null;
        mealFrequency: number | null;
        measurementSystem: string;
        medicalNotes: string | null;
        updatedBy: string;
        lastCalculatedAt: Date;
    }) | {
        id: string;
        userId: string;
        fullName: string;
        age: number;
        gender: string;
        height: number;
        weight: number;
        activityLevel: string;
        goal: string;
        user: {
            email: string;
        };
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        goal: string;
        version: number;
        fullName: string;
        gender: string;
        birthDate: Date | null;
        age: number;
        height: number;
        weight: number;
        targetWeight: number | null;
        bodyFatPercentage: number | null;
        activityLevel: string;
        dietPreference: string | null;
        allergies: string[];
        dislikedFoods: string[];
        preferredFoods: string[];
        gymExperience: string | null;
        workoutDays: number | null;
        sleepHours: number | null;
        wakeUpTime: string | null;
        mealFrequency: number | null;
        measurementSystem: string;
        medicalNotes: string | null;
        updatedBy: string;
        lastCalculatedAt: Date;
    } | {
        fullName: string;
        age: number;
        gender: string;
        height: number;
        weight: number;
        activityLevel: string;
        goal: string;
        id: string;
        userId: string;
    }>;
    getSecurityScore(req: any): Promise<{
        score: number;
        factors: {
            passwordQuality: "good" | "fair" | "poor";
            twoFactorReady: boolean;
            sessionCount: number;
            lastLoginDaysAgo: number;
            deviceTrust: "trusted" | "unknown";
            profileCompleteness: number;
        };
    }>;
    exportData(req: any): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            goal: string;
            version: number;
            fullName: string;
            gender: string;
            birthDate: Date | null;
            age: number;
            height: number;
            weight: number;
            targetWeight: number | null;
            bodyFatPercentage: number | null;
            activityLevel: string;
            dietPreference: string | null;
            allergies: string[];
            dislikedFoods: string[];
            preferredFoods: string[];
            gymExperience: string | null;
            workoutDays: number | null;
            sleepHours: number | null;
            wakeUpTime: string | null;
            mealFrequency: number | null;
            measurementSystem: string;
            medicalNotes: string | null;
            updatedBy: string;
            lastCalculatedAt: Date;
        };
        meals: ({
            items: {
                id: string;
                mealId: string;
                foodId: string | null;
                quantity: number;
                unit: string;
                calories: number;
                protein: number;
                fats: number;
                fiber: number;
                sugar: number;
                carbohydrates: number;
                foodName: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            mealType: string;
            source: string;
        })[];
        waterLogs: {
            id: string;
            createdAt: Date;
            userId: string;
            unit: string;
            amount: number;
        }[];
        supplementLogs: {
            id: string;
            createdAt: Date;
            name: string;
            userId: string;
            unit: string;
            dosage: number;
        }[];
        exerciseLogs: {
            id: string;
            createdAt: Date;
            userId: string;
            activityName: string;
            durationMinutes: number;
            caloriesBurned: number;
        }[];
        conversations: ({
            messages: {
                id: string;
                createdAt: Date;
                role: string;
                content: string;
                metadata: string | null;
                tokens: number;
                conversationId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
        })[];
        travelSessions: {
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
        }[];
        analyticsSnapshots: {
            id: string;
            createdAt: Date;
            userId: string;
            caloriesTarget: number;
            proteinTarget: number;
            carbsTarget: number;
            weight: number | null;
            date: Date;
            healthScore: number;
            consistencyScore: number;
            adherenceScore: number;
            bodyFat: number | null;
            caloriesConsumed: number;
            proteinConsumed: number;
            carbsConsumed: number;
            fatsConsumed: number;
            fatsTarget: number;
            waterConsumed: number;
            waterTarget: number;
            steps: number;
            workoutCalories: number;
        }[];
        notifications: {
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            type: string;
            body: string;
            read: boolean;
            scheduledFor: Date | null;
            deliveredAt: Date | null;
        }[];
        memories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            content: string;
            category: string;
            isPinned: boolean;
            isIgnored: boolean;
        }[];
        id: string;
        email: string;
        isSuspended: boolean;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteMemory(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    deleteAnalytics(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    deleteConversations(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    deleteTravel(req: any): Promise<{
        success: boolean;
        count: number;
    }>;
    softDelete(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    permanentDelete(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
