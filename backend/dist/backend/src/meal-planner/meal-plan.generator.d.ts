import { FoodSelectionEngine } from './food-selection.engine';
import { MacroValidationEngine } from './macro-validation.engine';
import { PrismaService } from '../prisma/prisma.service';
import { AIPipelineService } from '../ai/core/ai-pipeline.service';
export interface PlanGenerationContext {
    userId: string;
    type: 'daily' | 'weekly';
    goal: string;
    caloriesTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
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
export declare class MealPlanPlanGenerator {
    private readonly pipeline;
    private readonly foodSelectionEngine;
    private readonly macroValidationEngine;
    private readonly prisma;
    constructor(pipeline: AIPipelineService, foodSelectionEngine: FoodSelectionEngine, macroValidationEngine: MacroValidationEngine, prisma: PrismaService);
    generate(ctx: PlanGenerationContext): Promise<any>;
    private compileDeterministicFallback;
    private createPlannedMeal;
}
export default MealPlanPlanGenerator;
