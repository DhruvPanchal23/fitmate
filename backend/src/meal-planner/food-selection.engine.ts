import { Injectable } from '@nestjs/common';
import { Food, FoodSource } from '../generated/prisma';

export interface SelectionPreferences {
  goal: string;
  dietaryPreference?: 'none' | 'vegetarian' | 'vegan' | 'high_protein';
  allergies?: string[];
  budgetPreference?: 'low' | 'medium' | 'high';
  favoriteFoods?: string[];
  recentMeals?: string[];
  pantryItems?: Array<{ foodId: string; quantity: number }>;
}

@Injectable()
export class FoodSelectionEngine {
  rankFoods(
    candidates: Food[],
    prefs: SelectionPreferences,
    context: {
      mealType: string;
      alreadySelectedNames: Set<string>;
      leftoverIngredients: Set<string>;
    }
  ): Array<{ food: Food; score: number }> {
    const allergyList = (prefs.allergies || []).map((a) => a.toLowerCase().trim());
    const favoriteList = (prefs.favoriteFoods || []).map((f) => f.toLowerCase().trim());
    const recentList = (prefs.recentMeals || []).map((r) => r.toLowerCase().trim());
    
    const ranked = candidates
      .filter((food) => {
        const nameLower = food.name.toLowerCase();

        // 1. Allergy Filtering
        const hasAllergy = allergyList.some((allergy) => nameLower.includes(allergy));
        if (hasAllergy) return false;

        // 2. Dietary Preference Filtering
        if (prefs.dietaryPreference === 'vegetarian') {
          // If vegetarian, exclude common non-veg terms in mock catalog
          const isNonVeg = ['chicken', 'fish', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton'].some((nonVeg) =>
            nameLower.includes(nonVeg)
          );
          if (isNonVeg) return false;
        }

        if (prefs.dietaryPreference === 'vegan') {
          const isNonVegan = ['chicken', 'fish', 'beef', 'pork', 'turkey', 'shrimp', 'salmon', 'mutton', 'milk', 'paneer', 'egg', 'cheese', 'yogurt', 'butter'].some((nonVegan) =>
            nameLower.includes(nonVegan)
          );
          if (isNonVegan) return false;
        }

        return true;
      })
      .map((food) => {
        const nameLower = food.name.toLowerCase();
        let score = 100; // Base score

        // 3. Favorite Foods Bonus
        const isFavorite = favoriteList.some((fav) => nameLower.includes(fav) || fav.includes(nameLower));
        if (isFavorite) {
          score += 50;
        }

        // 4. Pantry Availability Bonus
        const inPantry = (prefs.pantryItems || []).some((item) => item.foodId === food.id && item.quantity > 0);
        if (inPantry) {
          score += 60; // Big bonus to prioritize using existing pantry stock
        }

        // 5. Leftover Reuse (Ingredient Loop Bonus)
        const isLeftover = Array.from(context.leftoverIngredients).some((ing) =>
          nameLower.includes(ing.toLowerCase())
        );
        if (isLeftover) {
          score += 40; // Leftover optimization bonus
        }

        // 6. Variety Penalty (avoid duplicate meals in same plan)
        if (context.alreadySelectedNames.has(food.name)) {
          score -= 45;
        }

        // 7. Budget Optimization
        if (prefs.budgetPreference === 'low') {
          // Penalize expensive foods. If averagePrice is defined, higher prices deduct points
          if (food.averagePrice) {
            score -= Math.round(food.averagePrice * 10);
          } else {
            // Assume premium named foods are expensive if averagePrice is missing
            const isPremium = ['salmon', 'avocado', 'almond', 'chia', 'quinoa', 'shrimp'].some((prem) =>
              nameLower.includes(prem)
            );
            if (isPremium) score -= 30;
          }
        } else if (prefs.budgetPreference === 'high') {
          // If high budget, reward premium high-quality proteins slightly
          const isPremium = ['salmon', 'quinoa', 'avocado', 'almond'].some((prem) =>
            nameLower.includes(prem)
          );
          if (isPremium) score += 20;
        }

        // 8. Macro/High Protein preference bonus
        if (prefs.dietaryPreference === 'high_protein') {
          const proteinRatio = (food.protein * 4) / food.calories; // % calories from protein
          if (proteinRatio > 0.3) {
            score += 30; // Bonus for high protein density
          }
        }

        // 9. Meal type matching heuristics
        if (context.mealType === 'Breakfast') {
          const isBreakfastFood = ['egg', 'oat', 'chilla', 'toast', 'fruit', 'yogurt', 'milk', 'shake', 'poha', 'upma'].some((bf) =>
            nameLower.includes(bf)
          );
          if (isBreakfastFood) score += 20;
        } else if (context.mealType === 'Snack') {
          const isSnackFood = ['nut', 'fruit', 'yogurt', 'shake', 'almond', 'apple', 'salad'].some((sn) =>
            nameLower.includes(sn)
          );
          if (isSnackFood) score += 20;
        } else {
          // Lunch/Dinner
          const isMainFood = ['rice', 'roti', 'chicken', 'paneer', 'tofu', 'dal', 'salad', 'curry', 'gravy'].some((mf) =>
            nameLower.includes(mf)
          );
          if (isMainFood) score += 20;
        }

        return { food, score };
      });

    // Sort by score descending
    return ranked.sort((a, b) => b.score - a.score);
  }
}
export default FoodSelectionEngine;
