import { Injectable } from '@nestjs/common';
import { NutritionService } from '../../nutrition/nutrition.service';
import { NutritionCalculatorService } from '../../nutrition/nutrition-calculator.service';

@Injectable()
export class NutritionRetriever {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly calculator: NutritionCalculatorService,
  ) {}

  async retrieve(userId: string) {
    try {
      const todayLogs = await this.nutritionService.getTodayLogs(userId);
      const todayStr = new Date().toISOString().split('T')[0];
      const summary = await this.calculator.calculateDailySummary(userId, todayStr);

      const caloriesEaten = todayLogs.calories.current;
      const calorieTarget = todayLogs.calories.target;
      const exerciseBurn = summary.exerciseCalories || 0;

      // Calorie surplus/deficit calculation: net calories
      // If we eat 2000, target is 2200, burn 300: net = 2000 - 2200 = -200 deficit.
      // Net calorie balance = caloriesEaten - calorieTarget. Workouts increase target allowance or burn extra.
      const calorieBalance = caloriesEaten - calorieTarget;

      return {
        calorieTarget,
        proteinTarget: todayLogs.protein.target,
        carbsTarget: todayLogs.carbs.target,
        fatTarget: todayLogs.fat.target,
        waterTarget: todayLogs.water.target,
        todayMacros: {
          calories: caloriesEaten,
          protein: todayLogs.protein.current,
          carbohydrates: todayLogs.carbs.current,
          fats: todayLogs.fat.current,
        },
        hydration: {
          current: todayLogs.water.current,
          target: todayLogs.water.target,
          status: todayLogs.water.current >= todayLogs.water.target ? 'Fully Hydrated' : 'Dehydrated',
        },
        calorieBalance,
        exerciseBurn,
      };
    } catch (e) {
      return null;
    }
  }
}
