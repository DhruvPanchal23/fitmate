export interface DailySummaryResponse {
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
}
