import { Injectable, NotFoundException } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';

@Injectable()
export class MealPlanShoppingService {
  constructor(private readonly repository: MealPlanRepository) {}

  async getShoppingList(planId: string) {
    const plan = await this.repository.findPlan(planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    // Aggregate duplicate foods
    const ingredientsMap: Record<string, {
      foodId: string | null;
      name: string;
      quantity: number;
      unit: string;
      estimatedCost: number;
    }> = {};

    for (const d of plan.days) {
      for (const m of d.meals) {
        const key = m.foodId || m.food?.name || m.notes || 'Other';
        const foodPrice = m.food?.averagePrice || 1.5; // Mock price fallback if missing

        if (ingredientsMap[key]) {
          ingredientsMap[key].quantity += m.quantity;
          ingredientsMap[key].estimatedCost += Math.round(m.quantity / 100 * foodPrice * 100) / 100;
        } else {
          ingredientsMap[key] = {
            foodId: m.foodId,
            name: m.food?.name || m.notes || 'Ingredient',
            quantity: m.quantity,
            unit: m.unit,
            estimatedCost: Math.round(m.quantity / 100 * foodPrice * 100) / 100,
          };
        }
      }
    }

    // Categorize
    const categories: Record<string, any[]> = {
      dairy: [],
      vegetables: [],
      fruits: [],
      grains: [],
      meat: [],
      spices: [],
      supplements: [],
      other: [],
    };

    let totalCost = 0;

    for (const key of Object.keys(ingredientsMap)) {
      const ing = ingredientsMap[key];
      totalCost += ing.estimatedCost;

      const nameLower = ing.name.toLowerCase();
      let cat = 'other';

      if (['milk', 'cheese', 'paneer', 'yogurt', 'curd', 'butter'].some((x) => nameLower.includes(x))) {
        cat = 'dairy';
      } else if (['chicken', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton', 'fish', 'tuna'].some((x) => nameLower.includes(x))) {
        cat = 'meat';
      } else if (['rice', 'oats', 'wheat', 'bread', 'roti', 'grains', 'quinoa'].some((x) => nameLower.includes(x))) {
        cat = 'grains';
      } else if (['broccoli', 'spinach', 'cucumber', 'vegetables', 'carrot', 'onion', 'garlic', 'tomato'].some((x) => nameLower.includes(x))) {
        cat = 'vegetables';
      } else if (['apple', 'banana', 'orange', 'fruit', 'berry', 'berries', 'strawberries'].some((x) => nameLower.includes(x))) {
        cat = 'fruits';
      } else if (['creatine', 'protein', 'supplement', 'vitamins'].some((x) => nameLower.includes(x))) {
        cat = 'supplements';
      } else if (['pepper', 'salt', 'spice', 'turmeric', 'chili', 'cardamom'].some((x) => nameLower.includes(x))) {
        cat = 'spices';
      }

      categories[cat].push({
        id: 'shop-' + Math.random().toString(36).substr(2, 9),
        foodId: ing.foodId,
        name: ing.name,
        quantity: Math.round(ing.quantity),
        unit: ing.unit,
        checked: false,
        purchased: false,
        estimatedCost: Math.round(ing.estimatedCost * 100) / 100,
        pantryDeduction: 0,
      });
    }

    return {
      planId,
      categories,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: 'USD',
    };
  }
}
export default MealPlanShoppingService;
