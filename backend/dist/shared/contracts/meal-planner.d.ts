export interface MealPlanMealResponse {
    id: string;
    mealType: string;
    foodId: string | null;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    notes: string | null;
    status: 'planned' | 'completed' | 'skipped' | 'replaced';
    completedAt: Date | null;
    loggedMealId: string | null;
}
export interface MealPlanDayResponse {
    id: string;
    dayOfWeek: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: MealPlanMealResponse[];
}
export interface MealPlanResponse {
    id: string;
    title: string;
    type: 'daily' | 'weekly';
    goal: string;
    caloriesTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    status: 'draft' | 'active' | 'archived';
    version: number;
    parentPlanId: string | null;
    startDate: Date | null;
    endDate: Date | null;
    timezone: string | null;
    regenerationsCount: number;
    replacementsCount: number;
    days: MealPlanDayResponse[];
    createdAt: Date;
    updatedAt: Date;
}
export interface PantryItemResponse {
    id: string;
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    expiryDate: Date | null;
}
export interface ShoppingListItem {
    id: string;
    foodId: string | null;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
    purchased: boolean;
    estimatedCost: number;
    pantryDeduction: number;
}
export interface ShoppingListResponse {
    planId: string;
    categories: Record<string, ShoppingListItem[]>;
    totalCost: number;
    currency: string;
}
export interface GenerateMealPlanRequest {
    title: string;
    type: 'daily' | 'weekly';
    goal: string;
    dietaryPreference?: 'none' | 'vegetarian' | 'vegan' | 'high_protein';
    allergies?: string[];
    budgetPreference?: 'low' | 'medium' | 'high';
    mealTimingPreference?: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
}
export interface ReplaceMealRequest {
    planId: string;
    mealId: string;
    foodId: string;
}
export interface ReplaceIngredientRequest {
    planId: string;
    mealId: string;
    newFoodId: string;
}
export interface RegenerateMealRequest {
    planId: string;
    mealId?: string;
    dayId?: string;
}
export interface SaveTemplateRequest {
    planId: string;
    title: string;
    description?: string;
}
export interface TemplateResponse {
    id: string;
    title: string;
    description: string | null;
    planData: any;
    createdAt: Date;
}
export interface PlannerInteractionRequest {
    planId?: string;
    mealId?: string;
    foodId?: string;
    interactionType: 'accepted_meal' | 'skipped_meal' | 'replaced_meal' | 'regenerated_meal' | 'completed_meal';
}
export interface PlannerInteractionResponse {
    success: boolean;
    interactionId: string;
}
