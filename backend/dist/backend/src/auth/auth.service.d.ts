import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session/session.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly sessionService;
    constructor(prisma: PrismaService, jwtService: JwtService, sessionService: SessionService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        userId: string;
        message?: undefined;
    } | {
        success: boolean;
        userId: string;
        message: string;
    }>;
    login(dto: LoginDto, clientInfo?: {
        fingerprint?: string;
        deviceInfo?: string;
        ipAddress?: string;
    }): Promise<{
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
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    private generateTokens;
}
export default AuthService;
