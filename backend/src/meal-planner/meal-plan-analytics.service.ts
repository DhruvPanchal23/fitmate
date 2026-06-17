import { Injectable, NotFoundException } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealPlanAnalyticsService {
  constructor(
    private readonly repository: MealPlanRepository,
    private readonly prisma: PrismaService,
  ) {}

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
export default MealPlanAnalyticsService;
