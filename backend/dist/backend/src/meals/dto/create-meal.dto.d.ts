export declare class CreateMealItemDto {
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
export declare class CreateMealDto {
    mealType: string;
    source: string;
    items: CreateMealItemDto[];
}
