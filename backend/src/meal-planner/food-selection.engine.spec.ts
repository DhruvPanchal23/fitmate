import { FoodSelectionEngine } from './food-selection.engine';
import { Food } from '../generated/prisma';

describe('FoodSelectionEngine', () => {
  const engine = new FoodSelectionEngine();

  const mockFoods: Food[] = [
    {
      id: 'food-1',
      name: 'Peanut Butter Toast',
      calories: 350,
      protein: 12,
      carbohydrates: 30,
      fats: 15,
      fiber: 4,
      sugar: 6,
      defaultUnit: 'g',
      servingSize: 100,
      averagePrice: 1.2,
      currency: 'USD',
      source: 'catalog' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'food-2',
      name: 'Chicken Breast Curry',
      calories: 400,
      protein: 45,
      carbohydrates: 10,
      fats: 10,
      fiber: 2,
      sugar: 1,
      defaultUnit: 'g',
      servingSize: 200,
      averagePrice: 4.5,
      currency: 'USD',
      source: 'catalog' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'food-3',
      name: 'Vegetable Salad',
      calories: 150,
      protein: 3,
      carbohydrates: 15,
      fats: 5,
      fiber: 6,
      sugar: 3,
      defaultUnit: 'g',
      servingSize: 150,
      averagePrice: 2.0,
      currency: 'USD',
      source: 'catalog' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should filter out allergens correctly', () => {
    const results = engine.rankFoods(
      mockFoods,
      { goal: 'fat_loss', allergies: ['chicken'] },
      { mealType: 'Lunch', alreadySelectedNames: new Set(), leftoverIngredients: new Set() }
    );

    expect(results).toHaveLength(2);
    expect(results.some((r) => r.food.name.includes('Chicken'))).toBe(false);
  });

  it('should filter out non-vegetarian foods when dietary preference is vegetarian', () => {
    const results = engine.rankFoods(
      mockFoods,
      { goal: 'fat_loss', dietaryPreference: 'vegetarian' },
      { mealType: 'Lunch', alreadySelectedNames: new Set(), leftoverIngredients: new Set() }
    );

    expect(results).toHaveLength(2);
    expect(results.some((r) => r.food.name.includes('Chicken'))).toBe(false);
  });

  it('should apply favorite food bonus', () => {
    const results = engine.rankFoods(
      mockFoods,
      { goal: 'fat_loss', favoriteFoods: ['Curry'] },
      { mealType: 'Lunch', alreadySelectedNames: new Set(), leftoverIngredients: new Set() }
    );

    const curryResult = results.find((r) => r.food.name.includes('Curry'));
    const toastResult = results.find((r) => r.food.name.includes('Toast'));

    expect(curryResult!.score).toBeGreaterThan(toastResult!.score);
  });
});
