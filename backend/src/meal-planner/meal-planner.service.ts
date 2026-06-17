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
import { TravelService } from '../travel/travel.service';
import { MemoryService } from '../ai/memory/memory.service';
import { MealPlanTemplatesService } from './meal-plan-templates.service';
import { MealPlanShoppingService } from './meal-plan-shopping.service';
import { MealPlanAnalyticsService } from './meal-plan-analytics.service';

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
    private readonly travelService: TravelService,
    private readonly memoryService: MemoryService,
    private readonly templatesService: MealPlanTemplatesService,
    private readonly shoppingService: MealPlanShoppingService,
    private readonly analyticsService: MealPlanAnalyticsService,
  ) {}

  async generatePlan(userId: string, dto: GenerateMealPlanRequest) {
    // 1. Resolve user parameters & targets
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      throw new BadRequestException('User profile must exist to generate plans');
    }

    // Check if recovery plan is active
    const recovery = await this.travelService.getRecoveryPlan(userId);
    const hasRecoveryPlan = !!recovery && recovery.plan.status === 'active';

    // Determine target calories and macros based on goal
    let calTarget = 2200;
    let protTarget = 150;
    let carbsTarget = 200;
    let fatTarget = 70;

    if (hasRecoveryPlan && recovery.todayTarget) {
      calTarget = recovery.todayTarget.caloriesTarget;
      protTarget = recovery.todayTarget.proteinTarget;
      carbsTarget = recovery.todayTarget.carbsTarget;
      fatTarget = recovery.todayTarget.fatsTarget;
    } else if (profile.goal === 'fat_loss') {
      calTarget = 1800; protTarget = 160; carbsTarget = 170; fatTarget = 60;
    } else if (profile.goal === 'muscle_gain') {
      calTarget = 2700; protTarget = 180; carbsTarget = 280; fatTarget = 80;
    }

    // Fetch pantry items & interactions for AI weights
    const pantryItems = await this.pantryRepository.findUserPantry(userId);
    const pantryArgs = pantryItems.map((pi) => ({ foodId: pi.foodId, quantity: pi.quantity }));

    // Fetch favorites and allergies from MemoryService
    const memories = await this.memoryService.getMemories(userId);
    const activeMemories = memories.filter(m => !m.isIgnored);

    const favoriteFoods = activeMemories
      .filter(m => m.category === 'favorite_foods')
      .map(m => m.content.replace(/Prefers\s+/i, ''));

    const memoryAllergies = activeMemories
      .filter(m => m.category === 'allergies')
      .map(m => m.content.replace(/Allergic to\s+/i, ''));

    const combinedAllergies = Array.from(new Set([
      ...(dto.allergies || []),
      ...memoryAllergies
    ]));

    const genCtx: PlanGenerationContext = {
      userId,
      type: dto.type,
      goal: dto.goal,
      caloriesTarget: calTarget,
      proteinTarget: protTarget,
      carbsTarget: carbsTarget,
      fatTarget: fatTarget,
      dietaryPreference: dto.dietaryPreference || 'none',
      allergies: combinedAllergies,
      budgetPreference: dto.budgetPreference || 'medium',
      favoriteFoods,
      pantryItems: pantryArgs,
      recoveryActive: hasRecoveryPlan,
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

  // --- Saved Templates (Delegated) ---

  async savePlanAsTemplate(userId: string, dto: SaveTemplateRequest) {
    return this.templatesService.savePlanAsTemplate(userId, dto);
  }

  async getTemplates(userId: string) {
    return this.templatesService.getTemplates(userId);
  }

  async deleteTemplate(id: string) {
    return this.templatesService.deleteTemplate(id);
  }

  // --- Shopping List Generation (Delegated) ---

  async getShoppingList(planId: string) {
    return this.shoppingService.getShoppingList(planId);
  }

  // --- Analytics Dashboard API (Delegated) ---

  async getAdherenceAnalytics(userId: string) {
    return this.analyticsService.getAdherenceAnalytics(userId);
  }
}
export default MealPlannerService;
