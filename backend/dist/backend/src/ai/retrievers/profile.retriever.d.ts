import { UsersService } from '../../users/users.service';
export declare class ProfileRetriever {
    private readonly usersService;
    constructor(usersService: UsersService);
    retrieve(userId: string): Promise<{
        fullName: string;
        age: number;
        gender: string;
        weight: number;
        height: number;
        activityLevel: string;
        goal: string;
    }>;
}
