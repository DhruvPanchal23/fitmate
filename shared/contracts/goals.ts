export interface SmartGoalsResponse {
  bmr: number;
  tdee: number;
  maintenanceCalories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;       // in liters
  creatine: number;    // in grams
  fiber: number;       // in grams
  sugar: number;       // in grams
  bmi: number;
  activityMultiplier: number;
  formula: string;
}

export interface GoalHistoryResponse {
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  creatine: number;
  fiber: number;
  sugar: number;
  maintenanceCalories: number;
  tdee: number;
  bmr: number;
  calculationFormula: string;
  profileVersion: number;
  engineVersion: string;
  goalSnapshot: SmartGoalsResponse; // Parsed snapshot JSON
  createdAt: string;
}
