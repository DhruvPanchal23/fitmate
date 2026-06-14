import { FoodResponse } from './food';

export interface FoodMatchResult {
  detectedName: string;
  bestMatch: FoodResponse | null;
  confidenceScore: number;
  alternativeMatches: FoodResponse[];
}
