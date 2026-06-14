import { Injectable } from '@nestjs/common';
import { MealsRepository } from '../meals/meals.repository';
import { WaterRepository } from '../water/water.repository';
import { SupplementsRepository } from '../supplements/supplements.repository';
import { ExerciseRepository } from '../exercise/exercise.repository';

@Injectable()
export class NutritionCalculatorService {
  constructor(
    private readonly mealsRepository: MealsRepository,
    private readonly waterRepository: WaterRepository,
    private readonly supplementsRepository: SupplementsRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async calculateDailySummary(userId: string, dateStr: string) {
    const [meals, waterLogs, supplementLogs, exerciseLogs] = await Promise.all([
      this.mealsRepository.findMany(userId, dateStr),
      this.waterRepository.findMany(userId, dateStr),
      this.supplementsRepository.findMany(userId, dateStr),
      this.exerciseRepository.findMany(userId, dateStr),
    ]);

    let calories = 0;
    let protein = 0;
    let carbohydrates = 0;
    let fats = 0;
    let fiber = 0;
    let sugar = 0;

    for (const meal of meals) {
      if ('items' in meal && Array.isArray(meal.items)) {
        for (const item of meal.items) {
          calories += item.calories || 0;
          protein += item.protein || 0;
          carbohydrates += item.carbohydrates || 0;
          fats += item.fats || 0;
          fiber += item.fiber || 0;
          sugar += item.sugar || 0;
        }
      }
    }

    const water = waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
    const supplements = Array.from(new Set(supplementLogs.map(log => log.name)));
    const exerciseCalories = exerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);

    return {
      date: dateStr,
      calories: Math.round(calories * 10),
      protein: Math.round(protein * 10),
      carbohydrates: Math.round(carbohydrates * 10),
      fats: Math.round(fats * 10),
      fiber: Math.round(fiber * 10),
      sugar: Math.round(sugar * 10),
      water: Math.round(water),
      supplements,
      exerciseCalories: Math.round(exerciseCalories),
    };
  }
}
