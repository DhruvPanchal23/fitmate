import { Injectable, OnModuleInit } from '@nestjs/common';
import { FoodsRepository } from './foods.repository';

@Injectable()
export class FoodsService implements OnModuleInit {
  private fallbackFoods = [
    { name: 'Oatmeal', calories: 150, protein: 6, carbohydrates: 27, fats: 3, fiber: 4, sugar: 1, defaultUnit: 'g', servingSize: 40, source: 'SYSTEM' },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbohydrates: 0, fats: 3.6, fiber: 0, sugar: 0, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
    { name: 'Hard Boiled Egg', calories: 78, protein: 6.3, carbohydrates: 0.6, fats: 5.3, fiber: 0, sugar: 0.6, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
    { name: 'Paneer', calories: 265, protein: 18, carbohydrates: 1.2, fats: 20.8, fiber: 0, sugar: 1.2, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
    { name: 'White Rice', calories: 130, protein: 2.7, carbohydrates: 28, fats: 0.3, fiber: 0.4, sugar: 0.1, defaultUnit: 'g', servingSize: 100, source: 'SYSTEM' },
    { name: 'Whey Protein', calories: 120, protein: 24, carbohydrates: 3, fats: 1.5, fiber: 0, sugar: 1, defaultUnit: 'scoop', servingSize: 1, source: 'SYSTEM' },
    { name: 'Apple', calories: 95, protein: 0.5, carbohydrates: 25, fats: 0.3, fiber: 4.4, sugar: 19, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
    { name: 'Banana', calories: 105, protein: 1.3, carbohydrates: 27, fats: 0.4, fiber: 3.1, sugar: 14, defaultUnit: 'piece', servingSize: 1, source: 'SYSTEM' },
  ] as const;

  constructor(private readonly repository: FoodsRepository) {}

  async onModuleInit() {
    try {
      for (const food of this.fallbackFoods) {
        const existing = await this.repository.findByName(food.name);
        if (!existing) {
          await this.repository.create({
            ...food,
            source: 'SYSTEM',
          });
        }
      }
    } catch (e) {
      // Fail silently if database is offline
    }
  }

  async searchFoods(query: string) {
    if (!query) return [];

    try {
      const dbResults = await this.repository.search(query);
      if (dbResults.length > 0) {
        return dbResults;
      }
    } catch (e) {
      // Fallback below
    }

    return this.fallbackFoods.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
