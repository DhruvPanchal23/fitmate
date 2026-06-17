import { AuthService } from './auth.service';
import { SessionService } from './session/session.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    private readonly sessionService;
    private readonly logger;
    constructor(authService: AuthService, usersService: UsersService, sessionService: SessionService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        userId: string;
        message?: undefined;
    } | {
        success: boolean;
        userId: string;
        message: string;
    }>;
    login(req: any, dto: LoginDto): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        message?: undefined;
    } | {
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
        };
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
    }>;
    refresh(req: any, body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(body: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
    }>;
    logoutAll(req: any): Promise<{
        success: boolean;
    }>;
    getSessions(req: any): Promise<{
        id: string;
        deviceInfo: string;
        ipAddress: string;
        lastLoginAt: Date;
        isCurrent: boolean;
    }[]>;
    revokeSession(id: string, req: any): Promise<{
        success: boolean;
    }>;
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
}
export default AuthController;
