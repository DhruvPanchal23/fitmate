import { Injectable } from '@nestjs/common';
import { FoodSelectionEngine, SelectionPreferences } from './food-selection.engine';
import { MacroValidationEngine } from './macro-validation.engine';
import { PrismaService } from '../prisma/prisma.service';
import { Food } from '../generated/prisma';
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
  pantryItems?: Array<{ foodId: string; quantity: number }>;
  recoveryActive?: boolean;
}

@Injectable()
export class MealPlanPlanGenerator {
  constructor(
    private readonly pipeline: AIPipelineService,
    private readonly foodSelectionEngine: FoodSelectionEngine,
    private readonly macroValidationEngine: MacroValidationEngine,
    private readonly prisma: PrismaService,
  ) {}

  async generate(ctx: PlanGenerationContext): Promise<any> {
    const catalogFoods = await this.prisma.food.findMany();

    // 1. Gather context & rank foods deterministically using FoodSelectionEngine
    const selectedNames = new Set<string>();
    const leftovers = new Set<string>();
    
    // Perform initial deterministic mapping for context guidelines
    const prefArgs: SelectionPreferences = {
      goal: ctx.goal,
      dietaryPreference: ctx.dietaryPreference,
      allergies: ctx.allergies,
      budgetPreference: ctx.budgetPreference,
      favoriteFoods: ctx.favoriteFoods,
      recentMeals: ctx.recentMeals,
      pantryItems: ctx.pantryItems,
      recoveryActive: ctx.recoveryActive,
    };

    // Rank candidate breakfast, main meals, and snacks
    const rankedBreakfast = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
      mealType: 'Breakfast',
      alreadySelectedNames: selectedNames,
      leftoverIngredients: leftovers,
    });

    const rankedMain = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
      mealType: 'Lunch',
      alreadySelectedNames: selectedNames,
      leftoverIngredients: leftovers,
    });

    const rankedSnacks = this.foodSelectionEngine.rankFoods(catalogFoods, prefArgs, {
      mealType: 'Snack',
      alreadySelectedNames: selectedNames,
      leftoverIngredients: leftovers,
    });

    // 2. Build Prompt block separating system rules, developer targets, and catalog context
    const systemPrompt = [
      'You are the FitMate AI Meal Planner.',
      'Construct a highly structured daily or weekly diet plan based on the user targets.',
      'Return a valid JSON string representing the meal plan.',
    ].join(' ');

    const developerInstructions = [
      'Generate a JSON block matching the structure:',
      '{',
      '  "title": "Diet Plan Title",',
      '  "days": [',
      '    {',
      '      "dayOfWeek": "Monday",',
      '      "meals": [',
      '        { "mealType": "Breakfast", "foodName": "Oatmeal Bowl", "quantity": 100, "unit": "g" },',
      '        { "mealType": "Lunch", "foodName": "Chicken Breast", "quantity": 150, "unit": "g" },',
      '        { "mealType": "Dinner", "foodName": "Paneer Rice", "quantity": 200, "unit": "g" },',
      '        { "mealType": "Snack", "foodName": "Greek Yogurt", "quantity": 150, "unit": "g" }',
      '      ]',
      '    }',
      '  ]',
      '}',
    ].join('\n');

    const contextStr = JSON.stringify({
      type: ctx.type,
      goals: {
        calories: ctx.caloriesTarget,
        protein: ctx.proteinTarget,
        carbs: ctx.carbsTarget,
        fats: ctx.fatTarget,
      },
      allergies: ctx.allergies,
      favorites: ctx.favoriteFoods,
      diet: ctx.dietaryPreference,
      topCandidates: {
        breakfast: rankedBreakfast.slice(0, 5).map(r => r.food.name),
        mainMeals: rankedMain.slice(0, 8).map(r => r.food.name),
        snacks: rankedSnacks.slice(0, 5).map(r => r.food.name),
      }
    }, null, 2);

    const prompt = [
      `=== ROLE ===\n${systemPrompt}`,
      `=== INSTRUCTIONS ===\n${developerInstructions}`,
      `=== USER CONTEXT ===\n${contextStr}`,
      `=== REQUEST ===\nGenerate a ${ctx.type} meal plan matching the user goals.`,
    ].join('\n\n');

    // 3. Call Consolidated AI Pipeline Service
    let parsedPlan: any;
    try {
      const pipelineRes = await this.pipeline.execute({
        userId: ctx.userId,
        promptKey: 'meal-planner',
        userMessage: `Generate a ${ctx.type} meal plan matching the user goals.`,
        additionalContext: `=== CANDIDATE TOP FOODS ===\n${contextStr}`,
        skipCache: true,
      });
      const rawResponse = pipelineRes.text;
      
      // Clean markdown code blocks if present
      let cleaned = rawResponse.trim();
      if (cleaned.includes('```json')) {
        cleaned = cleaned.split('```json')[1].split('```')[0].trim();
      } else if (cleaned.includes('```')) {
        cleaned = cleaned.split('```')[1].split('```')[0].trim();
      }

      parsedPlan = JSON.parse(cleaned);
    } catch (e) {
      // 4. Fallback: Fall back to deterministic plan compilation if LLM fails
      parsedPlan = this.compileDeterministicFallback(ctx, catalogFoods, rankedBreakfast, rankedMain, rankedSnacks);
    }

    // 5. Align LLM food names with actual database Food IDs, resolving macros
    const planDays: any[] = [];
    const daysToMap = ctx.type === 'weekly' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Day 1'];
    
    const parsedDays = Array.isArray(parsedPlan.days) ? parsedPlan.days : [];

    for (let idx = 0; idx < daysToMap.length; idx++) {
      const dayName = daysToMap[idx];
      const parsedDay = parsedDays.find((d: any) => d.dayOfWeek === dayName) || { meals: [] };

      const dayMeals: any[] = [];
      for (const meal of parsedDay.meals) {
        // Find matching food in the catalog
        const match = catalogFoods.find((f) =>
          f.name.toLowerCase().includes(meal.foodName?.toLowerCase() || '') ||
          (meal.foodName && meal.foodName.toLowerCase().includes(f.name.toLowerCase()))
        ) || catalogFoods[0]; // Fallback to first catalog food if no match

        const qty = Number(meal.quantity) || 100;
        const scale = qty / match.servingSize;

        dayMeals.push({
          mealType: meal.mealType,
          foodId: match.id,
          foodName: match.name,
          quantity: qty,
          unit: match.defaultUnit,
          calories: Math.round(match.calories * scale),
          protein: Math.round(match.protein * scale * 10) / 10,
          carbs: Math.round(match.carbohydrates * scale * 10) / 10,
          fats: Math.round(match.fats * scale * 10) / 10,
          notes: meal.notes || `Healthy ${meal.mealType}`,
        });
      }

      // Leftover optimization: If previous meals have chicken/oats, award bonuses
      // If dayMeals is empty, seed standard meals
      if (dayMeals.length === 0) {
        dayMeals.push(
          this.createPlannedMeal('Breakfast', rankedBreakfast[0].food, 80),
          this.createPlannedMeal('Lunch', rankedMain[0].food, 150),
          this.createPlannedMeal('Dinner', rankedMain[1 % rankedMain.length].food, 150),
          this.createPlannedMeal('Snack', rankedSnacks[0].food, 100),
        );
      }

      planDays.push({
        dayOfWeek: dayName,
        meals: dayMeals,
      });
    }

    // 6. Macro Validation & Rebalancing Engine check
    const validation = this.macroValidationEngine.validateAndRebalance(planDays, {
      calories: ctx.caloriesTarget,
      protein: ctx.proteinTarget,
      carbs: ctx.carbsTarget,
      fats: ctx.fatTarget,
    });

    return {
      title: parsedPlan.title || `${ctx.goal.replace('_', ' ')} Plan (v${ctx.type})`,
      goal: ctx.goal,
      type: ctx.type,
      caloriesTarget: ctx.caloriesTarget,
      proteinTarget: ctx.proteinTarget,
      carbsTarget: ctx.carbsTarget,
      fatTarget: ctx.fatTarget,
      days: validation.rebalancedDays,
    };
  }

  private compileDeterministicFallback(
    ctx: PlanGenerationContext,
    catalog: Food[],
    breakfast: any[],
    main: any[],
    snacks: any[]
  ) {
    const days = ctx.type === 'weekly' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Day 1'];
    
    return {
      title: `Plan for ${ctx.goal.replace('_', ' ')}`,
      days: days.map((dayName, idx) => {
        // Reuse proteins/veg across consecutive days (Leftovers Optimization)
        const lunchFood = main[idx % main.length].food;
        const dinnerFood = main[(idx + 1) % main.length].food;
        const bfFood = breakfast[idx % breakfast.length].food;
        const snFood = snacks[idx % snacks.length].food;

        return {
          dayOfWeek: dayName,
          meals: [
            { mealType: 'Breakfast', foodName: bfFood.name, quantity: 100, unit: bfFood.defaultUnit },
            { mealType: 'Lunch', foodName: lunchFood.name, quantity: 150, unit: lunchFood.defaultUnit },
            { mealType: 'Dinner', foodName: dinnerFood.name, quantity: 150, unit: dinnerFood.defaultUnit },
            { mealType: 'Snack', foodName: snFood.name, quantity: 120, unit: snFood.defaultUnit },
          ],
        };
      }),
    };
  }

  private createPlannedMeal(type: string, food: Food, quantity: number) {
    const scale = quantity / food.servingSize;
    return {
      mealType: type,
      foodId: food.id,
      foodName: food.name,
      quantity,
      unit: food.defaultUnit,
      calories: Math.round(food.calories * scale),
      protein: Math.round(food.protein * scale * 10) / 10,
      carbs: Math.round(food.carbohydrates * scale * 10) / 10,
      fats: Math.round(food.fats * scale * 10) / 10,
      notes: `Healthy ${type}`,
    };
  }
}
export default MealPlanPlanGenerator;
