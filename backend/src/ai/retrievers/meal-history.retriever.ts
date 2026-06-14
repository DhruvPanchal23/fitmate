import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MealHistoryRetriever {
  constructor(private readonly prisma: PrismaService) {}

  async retrieve(userId: string) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const startOfDay = new Date(todayStr);

      // 1. Today's meals
      const todayMeals = await this.prisma.meal.findMany({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Recent meals (past 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentMeals = await this.prisma.meal.findMany({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 3. Favorite foods (Top 5 logged food items)
      const favoriteFoodsRaw = await this.prisma.mealItem.groupBy({
        by: ['foodName'],
        where: {
          meal: {
            userId,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });
      const favoriteFoods = favoriteFoodsRaw.map(item => item.foodName);

      // 4. Calculate current streak (days with at least one meal log)
      const streak = await this.calculateStreak(userId);

      return {
        todayMeals: todayMeals.map((m) => ({
          type: m.mealType,
          source: m.source,
          items: m.items.map((i) => ({ name: i.foodName, calories: i.calories, qty: i.quantity, unit: i.unit })),
        })),
        recentHistoryCount: recentMeals.length,
        recentMealsSummary: recentMeals.slice(0, 10).map((m) => ({
          type: m.mealType,
          date: m.createdAt.toISOString().split('T')[0],
          items: m.items.map((i) => i.foodName),
        })),
        favoriteFoods,
        streak,
      };
    } catch (e) {
      return {
        todayMeals: [],
        recentHistoryCount: 0,
        recentMealsSummary: [],
        favoriteFoods: [],
        streak: 0,
      };
    }
  }

  private async calculateStreak(userId: string): Promise<number> {
    const meals = await this.prisma.meal.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (meals.length === 0) return 0;

    // Get unique dates when meals were logged
    const loggedDates = new Set(
      meals.map(m => m.createdAt.toISOString().split('T')[0])
    );

    let streak = 0;
    const checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (loggedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If they logged today but not yesterday, keep streak. If they haven't logged today either, check if they logged yesterday
        if (streak === 0) {
          // Check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (loggedDates.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return streak;
  }
}
