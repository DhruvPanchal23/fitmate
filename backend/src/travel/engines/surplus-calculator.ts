import { Injectable } from '@nestjs/common';

export interface DailyLogData {
  date: Date;
  meals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  }[];
  waterLogs: { amount: number }[];
  exerciseLogs: { caloriesBurned: number }[];
  steps?: number;
}

export interface TargetGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number; // in liters
}

@Injectable()
export class SurplusCalculator {
  calculateDailySummary(log: DailyLogData, targets: TargetGoals) {
    const caloriesConsumed = log.meals.reduce((sum, m) => sum + m.calories, 0);
    const protein = log.meals.reduce((sum, m) => sum + m.protein, 0);
    const carbs = log.meals.reduce((sum, m) => sum + m.carbohydrates, 0);
    const fats = log.meals.reduce((sum, m) => sum + m.fats, 0);

    const water = log.waterLogs.reduce((sum, w) => sum + w.amount, 0); // usually ml
    const exerciseCalories = log.exerciseLogs.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const steps = log.steps || 0;

    // Surplus = consumed calories - target calories - exercise calories burned
    const surplus = Math.max(0, caloriesConsumed - targets.calories - exerciseCalories);

    return {
      date: log.date,
      caloriesConsumed: Math.round(caloriesConsumed),
      caloriesTarget: Math.round(targets.calories),
      surplus: Math.round(surplus),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      water: Math.round(water), // stored in ml in database waterLog
      exerciseCalories: Math.round(exerciseCalories),
      steps,
    };
  }
}
export default SurplusCalculator;
