import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
}
