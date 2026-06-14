import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.mealPlan.create({
        data: {
          userId,
          title: data.title,
          type: data.type,
          goal: data.goal,
          caloriesTarget: data.caloriesTarget,
          proteinTarget: data.proteinTarget,
          carbsTarget: data.carbsTarget,
          fatTarget: data.fatTarget,
          status: data.status,
          version: data.version || 1,
          parentPlanId: data.parentPlanId || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          timezone: data.timezone || null,
        },
      });

      for (const day of data.days) {
        const dayRecord = await tx.mealPlanDay.create({
          data: {
            mealPlanId: plan.id,
            dayOfWeek: day.dayOfWeek,
            calories: day.calories,
            protein: day.protein,
            carbs: day.carbs,
            fats: day.fats,
          },
        });

        for (const meal of day.meals) {
          await tx.mealPlanMeal.create({
            data: {
              mealPlanDayId: dayRecord.id,
              mealType: meal.mealType,
              foodId: meal.foodId || null,
              quantity: meal.quantity,
              unit: meal.unit,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fats: meal.fats,
              notes: meal.notes || null,
              status: 'planned',
            },
          });
        }
      }

      return tx.mealPlan.findUnique({
        where: { id: plan.id },
        include: {
          days: {
            include: {
              meals: {
                include: {
                  food: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async findUserPlans(userId: string) {
    return this.prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPlan(id: string) {
    return this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        days: {
          include: {
            meals: {
              include: {
                food: true,
              },
            },
          },
        },
      },
    });
  }

  async updateMeal(mealId: string, data: any) {
    return this.prisma.mealPlanMeal.update({
      where: { id: mealId },
      data: {
        foodId: data.foodId,
        quantity: data.quantity,
        unit: data.unit,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats,
        notes: data.notes,
        status: data.status,
        completedAt: data.completedAt,
        loggedMealId: data.loggedMealId,
      },
      include: {
        food: true,
      },
    });
  }

  async updatePlanStatus(id: string, status: string) {
    return this.prisma.mealPlan.update({
      where: { id },
      data: { status },
    });
  }

  async archiveActivePlans(userId: string) {
    return this.prisma.mealPlan.updateMany({
      where: {
        userId,
        status: 'active',
      },
      data: {
        status: 'archived',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  async incrementRegens(id: string) {
    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        regenerationsCount: {
          increment: 1,
        },
      },
    });
  }

  async incrementReplacements(id: string) {
    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        replacementsCount: {
          increment: 1,
        },
      },
    });
  }

  // --- Saved Template Operations ---

  async saveTemplate(userId: string, title: string, description: string | undefined, planData: string) {
    return this.prisma.savedTemplate.create({
      data: {
        userId,
        title,
        description,
        planData,
      },
    });
  }

  async findTemplates(userId: string) {
    return this.prisma.savedTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.savedTemplate.delete({
      where: { id },
    });
  }

  // --- AI Learning / Interactions ---

  async logInteraction(userId: string, data: any) {
    return this.prisma.plannerInteraction.create({
      data: {
        userId,
        planId: data.planId || null,
        mealId: data.mealId || null,
        foodId: data.foodId || null,
        interactionType: data.interactionType,
      },
    });
  }

  async getInteractionsForUser(userId: string) {
    return this.prisma.plannerInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
export default MealPlanRepository;
