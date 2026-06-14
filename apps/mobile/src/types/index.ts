export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'maintenance';
}

export interface DailyLog {
  id: string;
  date: string;
  caloriesConsumed: number;
  waterConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
}
