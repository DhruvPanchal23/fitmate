export type FoodSource = 'SYSTEM' | 'USER_CREATED' | 'AI_GENERATED' | 'ADMIN_VERIFIED' | 'EXTERNAL_IMPORT';

export interface FoodResponse {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  defaultUnit: string;
  servingSize: number;
  source: FoodSource;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
