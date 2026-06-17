import { Injectable } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly calculator: NutritionCalculatorService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async getTodayLogs(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const summary = await this.calculator.calculateDailySummary(userId, todayStr);
    
    // Resolve user goals dynamically based on profile activityLevel and goal
    let goals = {
      calories: 2200,
      protein: 150,
      carbohydrates: 200,
      fats: 70,
      water: 2500,
    };

    try {
      const latestSnapshot = await this.prisma.goalHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (latestSnapshot && latestSnapshot.goalSnapshot) {
        const decoded = JSON.parse(latestSnapshot.goalSnapshot);
        goals = {
          calories: decoded.targetCalories ?? decoded.calories,
          protein: decoded.protein,
          carbohydrates: decoded.carbs,
          fats: decoded.fats,
          water: Math.round((decoded.water || 2.5) * 1000), // convert L to ml
        };
      }
    } catch (e) {
      // Keep default goals
    }

    return {
      calories: { current: summary.calories, target: goals.calories },
      protein: { current: summary.protein, target: goals.protein },
      carbs: { current: summary.carbohydrates, target: goals.carbohydrates },
      fat: { current: summary.fats, target: goals.fats },
      water: { current: summary.water, target: goals.water },
    };
  }

  async getSummary(userId: string) {
    // Generate summaries for the last 7 days
    const summaries = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySummary = await this.calculator.calculateDailySummary(userId, dateStr);
      summaries.push(daySummary);
    }
    return summaries;
  }
}
