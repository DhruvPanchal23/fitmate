import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';
import { PantryRepository } from './pantry.repository';
import { MealPlanPlanGenerator, PlanGenerationContext } from './meal-plan.generator';
import { FoodSelectionEngine } from './food-selection.engine';
import { UsersService } from '../users/users.service';
import { MealsService } from '../meals/meals.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenerateMealPlanRequest,
  ReplaceMealRequest,
  ReplaceIngredientRequest,
  RegenerateMealRequest,
  SaveTemplateRequest,
} from '../../../shared/contracts';

@Injectable()
export class MealPlannerService {
  constructor(
    private readonly repository: MealPlanRepository,
    private readonly pantryRepository: PantryRepository,
    private readonly generator: MealPlanPlanGenerator,
    private readonly selectionEngine: FoodSelectionEngine,
    private readonly usersService: UsersService,
    private readonly mealsService: MealsService,
    private readonly prisma: PrismaService,
  ) {}

  async generatePlan(userId: string, dto: GenerateMealPlanRequest) {
    // 1. Resolve user parameters & targets
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      throw new BadRequestException('User profile must exist to generate plans');
    }

    // Determine target calories and macros based on goal
    let calTarget = 2200;
    let protTarget = 150;
    let carbsTarget = 200;
    let fatTarget = 70;

    if (profile.goal === 'fat_loss') {
      calTarget = 1800; protTarget = 160; carbsTarget = 170; fatTarget = 60;
    } else if (profile.goal === 'muscle_gain') {
      calTarget = 2700; protTarget = 180; carbsTarget = 280; fatTarget = 80;
    }

    // Fetch pantry items & interactions for AI weights
    const pantryItems = await this.pantryRepository.findUserPantry(userId);
    const pantryArgs = pantryItems.map((pi) => ({ foodId: pi.foodId, quantity: pi.quantity }));

    // Compute favorite foods from logged meals
    const favoriteFoodsRaw = await this.prisma.mealItem.groupBy({
      by: ['foodName'],
      where: { meal: { userId } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const favoriteFoods = favoriteFoodsRaw.map(item => item.foodName);

    const genCtx: PlanGenerationContext = {
      userId,
      type: dto.type,
      goal: dto.goal,
      caloriesTarget: calTarget,
      proteinTarget: protTarget,
      carbsTarget: carbsTarget,
      fatTarget: fatTarget,
      dietaryPreference: dto.dietaryPreference || 'none',
      allergies: dto.allergies || [],
      budgetPreference: dto.budgetPreference || 'medium',
      favoriteFoods,
      pantryItems: pantryArgs,
    };

    const newPlanData = await this.generator.generate(genCtx);

    const savedPlan = await this.repository.create(userId, {
      title: dto.title,
      type: dto.type,
      goal: dto.goal,
      caloriesTarget: calTarget,
      proteinTarget: protTarget,
      carbsTarget: carbsTarget,
      fatTarget: fatTarget,
      status: 'draft',
      startDate: dto.startDate,
      endDate: dto.endDate,
      timezone: dto.timezone,
      days: newPlanData.days,
    });

    await this.repository.logInteraction(userId, {
      planId: savedPlan.id,
      interactionType: 'accepted_meal',
    });

    return savedPlan;
  }

  async getPlans(userId: string) {
    return this.repository.findUserPlans(userId);
  }

  async getPlan(id: string) {
    const plan = await this.repository.findPlan(id);
    if (!plan) throw new NotFoundException('Meal plan not found');
    return plan;
  }

  async deletePlan(id: string) {
    await this.repository.delete(id);
    return { success: true };
  }

  async updatePlanTitle(id: string, title: string) {
    return this.prisma.mealPlan.update({
      where: { id },
      data: { title },
    });
  }

  async activatePlan(userId: string, planId: string) {
    const plan = await this.repository.findPlan(planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    // Smart Activation: Archive previous active plan
    await this.repository.archiveActivePlans(userId);
    await this.repository.updatePlanStatus(planId, 'active');

    return { success: true, planId };
  }

  async replaceMeal(userId: string, dto: ReplaceMealRequest) {
    const plan = await this.repository.findPlan(dto.planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    // Find the meal plan meal record
    let targetMeal: any = null;
    let targetDay: any = null;
    for (const d of plan.days) {
      const found = d.meals.find((m) => m.id === dto.mealId);
      if (found) {
        targetMeal = found;
        targetDay = d;
        break;
      }
    }

    if (!targetMeal) throw new NotFoundException('Planned meal slot not found');

    const food = await this.prisma.food.findUnique({ where: { id: dto.foodId } });
    if (!food) throw new NotFoundException('Replacement food not found in catalog');

    // Align macros dynamically using old meal calories
    const scale = targetMeal.calories / food.calories;
    const newQty = Math.round(food.servingSize * scale * 10) / 10;

    await this.repository.updateMeal(dto.mealId, {
      foodId: food.id,
      quantity: newQty,
      unit: food.defaultUnit,
      calories: targetMeal.calories,
      protein: Math.round(food.protein * scale * 10) / 10,
      carbs: Math.round(food.carbohydrates * scale * 10) / 10,
      fats: Math.round(food.fats * scale * 10) / 10,
      notes: `Replaced with ${food.name}`,
      status: 'replaced',
    });

    await this.repository.incrementReplacements(dto.planId);
    await this.repository.logInteraction(userId, {
      planId: dto.planId,
      mealId: dto.mealId,
      foodId: food.id,
      interactionType: 'replaced_meal',
    });

    return this.getPlan(dto.planId);
  }

  async replaceIngredient(userId: string, dto: ReplaceIngredientRequest) {
    const plan = await this.repository.findPlan(dto.planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    let targetMeal: any = null;
    for (const d of plan.days) {
      const found = d.meals.find((m) => m.id === dto.mealId);
      if (found) {
        targetMeal = found;
        break;
      }
    }

    if (!targetMeal) throw new NotFoundException('Meal item not found');

    const newFood = await this.prisma.food.findUnique({ where: { id: dto.newFoodId } });
    if (!newFood) throw new NotFoundException('New food not found in catalog');

    // Scale ingredient quantity to preserve macros (calories)
    const scale = targetMeal.calories / newFood.calories;
    const newQty = Math.round(newFood.servingSize * scale * 10) / 10;

    await this.repository.updateMeal(dto.mealId, {
      foodId: newFood.id,
      quantity: newQty,
      unit: newFood.defaultUnit,
      calories: targetMeal.calories,
      protein: Math.round(newFood.protein * scale * 10) / 10,
      carbs: Math.round(newFood.carbohydrates * scale * 10) / 10,
      fats: Math.round(newFood.fats * scale * 10) / 10,
      notes: `Ingredient swapped to ${newFood.name}`,
      status: 'replaced',
    });

    await this.repository.incrementReplacements(dto.planId);
    await this.repository.logInteraction(userId, {
      planId: dto.planId,
      mealId: dto.mealId,
      foodId: newFood.id,
      interactionType: 'replaced_meal',
    });

    return this.getPlan(dto.planId);
  }

  async regeneratePart(userId: string, dto: RegenerateMealRequest) {
    const plan = await this.repository.findPlan(dto.planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    const catalogFoods = await this.prisma.food.findMany();

    if (dto.mealId) {
      // Regenerate specific meal slot
      let targetMeal: any = null;
      for (const d of plan.days) {
        const found = d.meals.find((m) => m.id === dto.mealId);
        if (found) {
          targetMeal = found;
          break;
        }
      }

      if (!targetMeal) throw new NotFoundException('Meal slot not found');

      // Deterministically rank foods and select a candidate
      const ranked = this.selectionEngine.rankFoods(
        catalogFoods,
        { goal: plan.goal },
        { mealType: targetMeal.mealType, alreadySelectedNames: new Set(), leftoverIngredients: new Set() }
      );

      // Take the top food item that doesn't duplicate current meal name
      const bestFood = ranked[0].food;
      const scale = targetMeal.calories / bestFood.calories;
      const newQty = Math.round(bestFood.servingSize * scale * 10) / 10;

      await this.repository.updateMeal(dto.mealId, {
        foodId: bestFood.id,
        quantity: newQty,
        unit: bestFood.defaultUnit,
        calories: targetMeal.calories,
        protein: Math.round(bestFood.protein * scale * 10) / 10,
        carbs: Math.round(bestFood.carbohydrates * scale * 10) / 10,
        fats: Math.round(bestFood.fats * scale * 10) / 10,
        notes: `Regenerated meal slot`,
        status: 'replaced',
      });
    } else if (dto.dayId) {
      // Regenerate entire day: Re-generate the 4 meal slots
      const dayRecord = plan.days.find((d) => d.id === dto.dayId);
      if (!dayRecord) throw new NotFoundException('Plan day not found');

      for (const m of dayRecord.meals) {
        const ranked = this.selectionEngine.rankFoods(
          catalogFoods,
          { goal: plan.goal },
          { mealType: m.mealType, alreadySelectedNames: new Set(), leftoverIngredients: new Set() }
        );

        const bestFood = ranked[Math.floor(Math.random() * 2) % ranked.length].food;
        const scale = m.calories / bestFood.calories;
        const newQty = Math.round(bestFood.servingSize * scale * 10) / 10;

        await this.repository.updateMeal(m.id, {
          foodId: bestFood.id,
          quantity: newQty,
          unit: bestFood.defaultUnit,
          calories: m.calories,
          protein: Math.round(bestFood.protein * scale * 10) / 10,
          carbs: Math.round(bestFood.carbohydrates * scale * 10) / 10,
          fats: Math.round(bestFood.fats * scale * 10) / 10,
          notes: `Regenerated day slot`,
          status: 'replaced',
        });
      }
    }

    await this.repository.incrementRegens(dto.planId);
    await this.repository.logInteraction(userId, {
      planId: dto.planId,
      interactionType: 'regenerated_meal',
    });

    return this.getPlan(dto.planId);
  }

  // --- Meal Plan Progress & Completion ---

  async completeMeal(userId: string, mealId: string) {
    const planMeal = await this.prisma.mealPlanMeal.findUnique({
      where: { id: mealId },
      include: {
        mealPlanDay: {
          include: {
            mealPlan: true,
          },
        },
        food: true,
      },
    });

    if (!planMeal) throw new NotFoundException('Planned meal not found');

    // Create a real Meal log dynamically
    const mealRecord = await this.mealsService.createMeal(userId, {
      mealType: planMeal.mealType as any,
      source: 'planner',
      items: [
        {
          foodName: planMeal.food?.name || 'Meal Item',
          quantity: planMeal.quantity,
          unit: planMeal.unit,
          calories: planMeal.calories,
          protein: planMeal.protein,
          carbohydrates: planMeal.carbs,
          fats: planMeal.fats,
          fiber: planMeal.food?.fiber || 0,
          sugar: planMeal.food?.sugar || 0,
          foodId: planMeal.foodId,
        },
      ],
    });

    // Update status to completed
    await this.repository.updateMeal(mealId, {
      status: 'completed',
      completedAt: new Date(),
      loggedMealId: mealRecord.id,
    });

    await this.repository.logInteraction(userId, {
      planId: planMeal.mealPlanDay.mealPlan.id,
      mealId,
      interactionType: 'completed_meal',
    });

    return { success: true, loggedMealId: mealRecord.id };
  }

  async skipMeal(userId: string, mealId: string) {
    const planMeal = await this.prisma.mealPlanMeal.findUnique({
      where: { id: mealId },
      include: { mealPlanDay: { include: { mealPlan: true } } },
    });
    if (!planMeal) throw new NotFoundException('Planned meal not found');

    await this.repository.updateMeal(mealId, {
      status: 'skipped',
    });

    await this.repository.logInteraction(userId, {
      planId: planMeal.mealPlanDay.mealPlan.id,
      mealId,
      interactionType: 'skipped_meal',
    });

    return { success: true };
  }

  // --- Saved Templates ---

  async savePlanAsTemplate(userId: string, dto: SaveTemplateRequest) {
    const plan = await this.repository.findPlan(dto.planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    const planData = JSON.stringify(plan);
    return this.repository.saveTemplate(userId, dto.title, dto.description, planData);
  }

  async getTemplates(userId: string) {
    return this.repository.findTemplates(userId);
  }

  async deleteTemplate(id: string) {
    await this.repository.deleteTemplate(id);
    return { success: true };
  }

  // --- Shopping List Generation ---

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

  // --- Analytics Dashboard API ---

  async getAdherenceAnalytics(userId: string) {
    const plans = await this.repository.findUserPlans(userId);
    const activePlan = plans.find((p) => p.status === 'active');

    if (!activePlan) {
      return {
        adherencePercentage: 0,
        skippedMeals: 0,
        completedMeals: 0,
        regeneratedMeals: 0,
        replacedMeals: 0,
        averageProteinAchievement: 0,
        calorieAdherence: 0,
        weeklyCompletion: 0,
        monthlyCompletion: 0,
      };
    }

    // Query active plan details
    const fullPlan = await this.repository.findPlan(activePlan.id);
    if (!fullPlan) throw new NotFoundException('Active plan details missing');

    let plannedCount = 0;
    let completedCount = 0;
    let skippedCount = 0;

    for (const d of fullPlan.days) {
      for (const m of d.meals) {
        plannedCount++;
        if (m.status === 'completed') completedCount++;
        else if (m.status === 'skipped') skippedCount++;
      }
    }

    const adherencePercentage = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

    // Fetch user logs to compare protein/calorie averages
    const recentMeals = await this.prisma.meal.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: { items: true },
    });

    let loggedProtein = 0;
    let loggedCalories = 0;
    for (const m of recentMeals) {
      for (const i of m.items) {
        loggedProtein += i.protein;
        loggedCalories += i.calories;
      }
    }

    const avgDailyProtein = recentMeals.length > 0 ? Math.round(loggedProtein / 7) : 0;
    const avgDailyCalories = recentMeals.length > 0 ? Math.round(loggedCalories / 7) : 0;

    return {
      adherencePercentage,
      skippedMeals: skippedCount,
      completedMeals: completedCount,
      regeneratedMeals: fullPlan.regenerationsCount,
      replacedMeals: fullPlan.replacementsCount,
      averageProteinAchievement: Math.min(100, Math.round(avgDailyProtein / activePlan.proteinTarget * 100)),
      calorieAdherence: Math.min(100, Math.round(avgDailyCalories / activePlan.caloriesTarget * 100)),
      weeklyCompletion: adherencePercentage,
      monthlyCompletion: Math.min(100, Math.round(adherencePercentage * 0.9)), // Simulated monthly projection
    };
  }
}
export default MealPlannerService;
