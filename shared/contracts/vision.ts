export interface VisionDetectedItem {
  foodName: string;
  estimatedQuantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  confidence: number;
}

export interface VisionRawResponse {
  model: string;
  detectedItems: VisionDetectedItem[];
}
