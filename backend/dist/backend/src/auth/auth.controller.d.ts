import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        userId: string;
        message?: undefined;
    } | {
        success: boolean;
        userId: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
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
    getProfile(req: any): Promise<({
        user: {
            email: string;
        };
    } & {
        fullName: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        age: number;
        gender: string;
        weight: number;
        height: number;
        activityLevel: string;
        goal: string;
        userId: string;
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
