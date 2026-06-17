import { BmrStrategy, getBmrStrategy } from '../strategies/formula-strategy';
import { ACTIVITY_MULTIPLIERS } from '../config/activity-multipliers.config';

export class BMRCalculator {
  calculate(params: {
    gender: string;
    age: number;
    weight: number;
    height: number;
    bodyFatPercentage?: number | null;
    formula: string;
  }): number {
    const strategy = getBmrStrategy(params.formula);
    return Math.round(strategy.calculate(params));
  }
}

export class TDEECalculator {
  calculate(bmr: number, activityLevel: string): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel.toLowerCase()] || 1.2;
    return Math.round(bmr * multiplier);
  }
}

export class MacroCalculator {
  calculate(params: {
    tdee: number;
    goal: string;
    weight: number;
    dietPreference: string;
  }): { calories: number; protein: number; fats: number; carbs: number } {
    const { tdee, goal, weight } = params;
    
    // Calorie Adjustment based on Goal
    let calories = tdee;
    if (goal === 'fat_loss') {
      calories = Math.max(1200, tdee - 500);
    } else if (goal === 'muscle_gain') {
      calories = tdee + 300;
    } else if (goal === 'lean_bulk') {
      calories = tdee + 500;
    }
    calories = Math.round(calories);

    // Protein Target: 1.8g to 2.2g per kg
    let proteinMultiplier = 1.8;
    if (goal === 'muscle_gain' || goal === 'lean_bulk') {
      proteinMultiplier = 2.2;
    }
    let protein = Math.round(weight * proteinMultiplier);
    // Cap protein min/max
    protein = Math.max(40, Math.min(protein, 300));
    const proteinCal = protein * 4;

    // Fats Target: 25% of total calories
    let fatsCal = calories * 0.25;
    let fats = Math.round(fatsCal / 9);
    fats = Math.max(20, Math.min(fats, 150));
    const actualFatsCal = fats * 9;

    // Carbs Target: Remainder
    let carbsCal = calories - proteinCal - actualFatsCal;
    let carbs = Math.round(carbsCal / 4);
    if (carbs < 20) {
      carbs = 20; // Safe minimum
    }

    return {
      calories,
      protein,
      fats,
      carbs,
    };
  }
}

export class WaterCalculator {
  calculate(weight: number, activityLevel: string): number {
    // Base hydration: 33ml per kg
    let water = weight * 0.033;
    
    // Add water for active lifestyle
    if (activityLevel.toLowerCase() === 'active' || activityLevel.toLowerCase() === 'athlete') {
      water += 0.75;
    } else if (activityLevel.toLowerCase() === 'moderate') {
      water += 0.4;
    }

    // Round to 1 decimal place, cap between 2L and 5L
    water = Math.round(water * 10) / 10;
    return Math.max(2.0, Math.min(5.0, water));
  }
}

export class CreatineCalculator {
  calculate(weight: number, goal: string, gymExperience: string): number {
    if (goal === 'muscle_gain' || goal === 'lean_bulk' || gymExperience !== 'beginner') {
      return weight > 90 ? 7.0 : 5.0;
    }
    if (goal === 'fat_loss') {
      return 3.0; // Maintenance during cut
    }
    return 0.0;
  }
}

export class FiberCalculator {
  calculate(calories: number, gender: string): number {
    // 14g per 1000 kcal
    let fiber = Math.round((calories / 1000) * 14);
    // Gender adjustments if needed
    const baseMin = gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm' ? 30 : 21;
    return Math.max(baseMin, Math.min(45, fiber));
  }
}

export class SugarCalculator {
  calculate(calories: number): number {
    // 10% limit
    return Math.round((calories * 0.10) / 4);
  }
}

export class BMIHelper {
  calculate(weight: number, height: number): number {
    const heightM = height / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
  }
}
