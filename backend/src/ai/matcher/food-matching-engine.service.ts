import { Injectable } from '@nestjs/common';
import { FoodsRepository } from '../../nutrition/foods.repository';
import { FoodMatchResult } from '../../../../shared/contracts';

@Injectable()
export class FoodMatchingEngine {
  constructor(private readonly foodsRepository: FoodsRepository) {}

  async matchFood(detectedName: string): Promise<FoodMatchResult> {
    try {
      const results = await this.foodsRepository.search(detectedName);
      
      if (results.length === 0) {
        // Fallback alternatives
        const defaults = await this.foodsRepository.search('Oatmeal');
        return {
          detectedName,
          bestMatch: null,
          confidenceScore: 0.0,
          alternativeMatches: defaults.map((food: any) => ({
            id: food.id,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbohydrates: food.carbohydrates,
            fats: food.fats,
            fiber: food.fiber,
            sugar: food.sugar,
            defaultUnit: food.defaultUnit,
            servingSize: food.servingSize,
            source: food.source,
          })),
        };
      }

      // Check for exact case-insensitive match
      const exactMatch = results.find(
        (r) => r.name.toLowerCase() === detectedName.toLowerCase()
      );

      if (exactMatch) {
        const alternatives = results.filter((r) => r.id !== exactMatch.id);
        return {
          detectedName,
          bestMatch: exactMatch as any,
          confidenceScore: 0.98,
          alternativeMatches: alternatives as any[],
        };
      }

      // First result is best partial match
      const best = results[0];
      const alternatives = results.slice(1);
      return {
        detectedName,
        bestMatch: best as any,
        confidenceScore: 0.85,
        alternativeMatches: alternatives as any[],
      };
    } catch (e) {
      return {
        detectedName,
        bestMatch: null,
        confidenceScore: 0.0,
        alternativeMatches: [],
      };
    }
  }
}
export default FoodMatchingEngine;
