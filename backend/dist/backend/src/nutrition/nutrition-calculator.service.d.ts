import { MealsRepository } from '../meals/meals.repository';
import { WaterRepository } from '../water/water.repository';
import { SupplementsRepository } from '../supplements/supplements.repository';
import { ExerciseRepository } from '../exercise/exercise.repository';
export declare class NutritionCalculatorService {
    private readonly mealsRepository;
    private readonly waterRepository;
    private readonly supplementsRepository;
    private readonly exerciseRepository;
    constructor(mealsRepository: MealsRepository, waterRepository: WaterRepository, supplementsRepository: SupplementsRepository, exerciseRepository: ExerciseRepository);
    calculateDailySummary(userId: string, dateStr: string): Promise<{
        date: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
        fiber: number;
        sugar: number;
        water: number;
        supplements: string[];
        exerciseCalories: number;
    }>;
}
