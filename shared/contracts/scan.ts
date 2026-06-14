import { FoodMatchResult } from './food-match';
import { MealResponse } from './meal';

export interface ScanItemDraft {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  confidence: number;
  foodId: string | null;
  alternatives: { id: string; name: string; calories: number }[];
}

export interface MealScanResponse {
  id: string;
  userId: string;
  imageUrl: string;
  model: string;
  confidence: number;
  status: string; // DRAFT, CONFIRMED
  items: ScanItemDraft[];
  mealId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ConfirmScanRequest {
  scanId: string;
  mealType: string;
  items: {
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sugar: number;
    foodId: string | null;
  }[];
}

export interface ConfirmScanResponse {
  success: boolean;
  meal: MealResponse;
}

export interface RetryScanRequest {
  scanId: string;
}
