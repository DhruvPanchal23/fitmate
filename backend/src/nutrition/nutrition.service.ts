import { Injectable } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly calculator: NutritionCalculatorService,
    private readonly usersService: UsersService,
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
      const profile = await this.usersService.getProfile(userId);
      if (profile) {
        if (profile.goal === 'fat_loss') {
          goals = { calories: 1800, protein: 160, carbohydrates: 170, fats: 60, water: 3000 };
        } else if (profile.goal === 'muscle_gain') {
          goals = { calories: 2700, protein: 180, carbohydrates: 280, fats: 80, water: 3000 };
        }
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
