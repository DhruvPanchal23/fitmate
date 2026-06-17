import { NutritionCalculatorService } from './nutrition-calculator.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class NutritionService {
    private readonly calculator;
    private readonly usersService;
    private readonly prisma;
    constructor(calculator: NutritionCalculatorService, usersService: UsersService, prisma: PrismaService);
    getTodayLogs(userId: string): Promise<{
        calories: {
            current: number;
            target: number;
        };
        protein: {
            current: number;
            target: number;
        };
        carbs: {
            current: number;
            target: number;
        };
        fat: {
            current: number;
            target: number;
        };
        water: {
            current: number;
            target: number;
        };
    }>;
    getSummary(userId: string): Promise<any[]>;
}
