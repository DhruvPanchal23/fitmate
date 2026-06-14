import { NutritionService } from '../../nutrition/nutrition.service';
import { NutritionCalculatorService } from '../../nutrition/nutrition-calculator.service';
export declare class NutritionRetriever {
    private readonly nutritionService;
    private readonly calculator;
    constructor(nutritionService: NutritionService, calculator: NutritionCalculatorService);
    retrieve(userId: string): Promise<{
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
    }>;
}
