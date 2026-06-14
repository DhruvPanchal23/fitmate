export interface MealItemResponse {
    id: string;
    mealId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sugar: number;
}
export interface MealResponse {
    id: string;
    userId: string;
    mealType: string;
    source: string;
    createdAt: Date | string;
    items: MealItemResponse[];
}
export interface CreateMealItemRequest {
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sugar: number;
}
export interface CreateMealRequest {
    mealType: string;
    source: string;
    items: CreateMealItemRequest[];
}
