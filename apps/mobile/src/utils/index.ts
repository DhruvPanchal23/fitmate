import { UserProfile } from '../types';

/**
 * Calculates BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation.
 */
export function calculateBMR(age: number, weight: number, height: number, gender: 'male' | 'female' = 'male'): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

/**
 * Calculates TDEE (Total Daily Energy Expenditure) based on BMR and activity multiplier.
 */
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Recommends target calorie levels based on goals.
 */
export function calculateCalorieTarget(tdee: number, goal: UserProfile['fitnessGoal']): number {
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee - 500); // 500 kcal deficit
    case 'muscle_gain':
      return Math.round(tdee + 300); // 300 kcal surplus
    case 'maintenance':
    default:
      return tdee;
  }
}
