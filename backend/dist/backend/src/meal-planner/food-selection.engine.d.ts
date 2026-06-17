import { Food } from '../generated/prisma';
export interface SelectionPreferences {
    goal: string;
    dietaryPreference?: 'none' | 'vegetarian' | 'vegan' | 'high_protein';
    allergies?: string[];
    budgetPreference?: 'low' | 'medium' | 'high';
    favoriteFoods?: string[];
    recentMeals?: string[];
    pantryItems?: Array<{
        foodId: string;
        quantity: number;
    }>;
    recoveryActive?: boolean;
}
export declare class FoodSelectionEngine {
    rankFoods(candidates: Food[], prefs: SelectionPreferences, context: {
        mealType: string;
        alreadySelectedNames: Set<string>;
        leftoverIngredients: Set<string>;
    }): Array<{
        food: Food;
        score: number;
    }>;
}
export default FoodSelectionEngine;
