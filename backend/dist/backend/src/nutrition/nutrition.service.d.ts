import { NutritionCalculatorService } from './nutrition-calculator.service';
import { UsersService } from '../users/users.service';
export declare class NutritionService {
    private readonly calculator;
    private readonly usersService;
    constructor(calculator: NutritionCalculatorService, usersService: UsersService);
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
