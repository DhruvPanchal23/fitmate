import { Injectable } from '@nestjs/common';

@Injectable()
export class MealDiversityScoreService {
  calculateScore(days: any[]): number {
    if (!days || days.length === 0) return 100;

    let totalScore = 100;
    const foodFrequency: Record<string, number> = {};
    const mealFrequency: Record<string, number> = {};

    for (const day of days) {
      const dayFoods = new Set<string>();

      for (const meal of day.meals) {
        if (!meal.foodName) continue;

        // 1. Same-day repetition penalty
        if (dayFoods.has(meal.foodName)) {
          totalScore -= 15; // Penalty for eating the exact same item twice in a day
        }
        dayFoods.add(meal.foodName);

        // 2. Weekly repetition count
        foodFrequency[meal.foodName] = (foodFrequency[meal.foodName] || 0) + 1;

        // 3. Complete meal repetition count
        const mealKey = `${meal.mealType}:${meal.foodName}`;
        mealFrequency[mealKey] = (mealFrequency[mealKey] || 0) + 1;
      }
    }

    // Penalize over-frequent foods across the week (unless it is leftovers optimization)
    // If a food appears more than 4 times in a week, deduct 5 points per excess appearance
    for (const food of Object.keys(foodFrequency)) {
      const count = foodFrequency[food];
      if (count > 4) {
        totalScore -= (count - 4) * 5;
      }
    }

    // Penalize exact meal slot duplicate repeats (e.g., eating exactly same breakfast 7 days a week)
    for (const mealKey of Object.keys(mealFrequency)) {
      const count = mealFrequency[mealKey];
      if (count > 3) {
        totalScore -= (count - 3) * 5;
      }
    }

    return Math.max(10, totalScore);
  }
}
export default MealDiversityScoreService;
