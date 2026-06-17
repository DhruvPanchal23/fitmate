import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitEngine {
  constructor(private readonly prisma: PrismaService) {}

  async calculateHabitAnalytics(userId: string) {
    const habitsList = ['water', 'meal_logging', 'workout', 'planner', 'sleep', 'ai_coach'];
    const habitsStats: Record<string, { streak: number; completionRate: number; targetFrequency: number }> = {};

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    // Check last 7 days and 30 days of logs for streaks and rates
    const dates7: Date[] = [];
    const dates30: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * dayMs);
      d.setUTCHours(0, 0, 0, 0);
      dates30.push(d);
      if (i < 7) {
        dates7.push(d);
      }
    }

    // 1. Fetch data logs for the last 30 days
    const minDate = dates30[29];

    const [meals, waterLogs, exercises, plannerInteractions, coachMessages, profile] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId, createdAt: { gte: minDate } },
        select: { createdAt: true },
      }),
      this.prisma.waterLog.findMany({
        where: { userId, createdAt: { gte: minDate } },
        select: { createdAt: true },
      }),
      this.prisma.exerciseLog.findMany({
        where: { userId, createdAt: { gte: minDate } },
        select: { createdAt: true },
      }),
      this.prisma.plannerInteraction.findMany({
        where: { userId, createdAt: { gte: minDate } },
        select: { createdAt: true },
      }),
      this.prisma.conversationMessage.findMany({
        where: {
          conversation: { userId },
          createdAt: { gte: minDate },
        },
        select: { createdAt: true },
      }),
      this.prisma.userProfile.findUnique({
        where: { userId },
        select: { sleepHours: true },
      }),
    ]);

    // Helpers to check if a date had logs
    const hasLogOnDate = (logs: Array<{ createdAt: Date }>, date: Date) => {
      const start = date.getTime();
      const end = start + dayMs;
      return logs.some(log => {
        const t = log.createdAt.getTime();
        return t >= start && t < end;
      });
    };

    // Calculate details for each habit
    for (const habit of habitsList) {
      let logs: Array<{ createdAt: Date }> = [];
      let targetFreq = 7; // Target days per week

      switch (habit) {
        case 'water':
          logs = waterLogs;
          targetFreq = 7;
          break;
        case 'meal_logging':
          logs = meals;
          targetFreq = 7;
          break;
        case 'workout':
          logs = exercises;
          targetFreq = 4; // Target 4 workouts a week
          break;
        case 'planner':
          logs = plannerInteractions;
          targetFreq = 5;
          break;
        case 'sleep':
          // Sleep logging: check if they did water/meal/exercise logs as a proxy of active day tracking,
          // or if they have sleepHours defined.
          logs = meals; // let's proxy sleep logging to meal logging for simplicity
          targetFreq = 7;
          break;
        case 'ai_coach':
          logs = coachMessages;
          targetFreq = 3; // Target chat 3 times a week
          break;
      }

      // Calculate streak
      let streak = 0;
      for (const d of dates30) {
        if (hasLogOnDate(logs, d)) {
          streak++;
        } else {
          // If it's today and they haven't logged yet, don't break the streak yet.
          // But if it's yesterday and they missed it, break it.
          const isToday = d.getTime() === dates30[0].getTime();
          if (!isToday) {
            break;
          }
        }
      }

      // Calculate completion rates
      let completed7 = 0;
      let completed30 = 0;

      for (const d of dates30) {
        if (hasLogOnDate(logs, d)) {
          completed30++;
        }
      }
      for (const d of dates7) {
        if (hasLogOnDate(logs, d)) {
          completed7++;
        }
      }

      const completionRate = completed7 / 7;

      habitsStats[habit] = {
        streak,
        completionRate,
        targetFrequency: targetFreq,
      };
    }

    // Weekly and Monthly Scores (Average completion rate of all habits)
    const habitValues = Object.values(habitsStats);
    const avgCompletion = habitValues.reduce((sum, h) => sum + h.completionRate, 0) / habitValues.length;
    const weeklyScore = Math.round(avgCompletion * 100);

    // Monthly score based on 30-day ratios
    let totalCompleted30 = 0;
    for (const habit of habitsList) {
      let logs: Array<{ createdAt: Date }> = [];
      if (habit === 'water') logs = waterLogs;
      else if (habit === 'meal_logging') logs = meals;
      else if (habit === 'workout') logs = exercises;
      else if (habit === 'planner') logs = plannerInteractions;
      else if (habit === 'sleep') logs = meals;
      else if (habit === 'ai_coach') logs = coachMessages;

      let completed = 0;
      for (const d of dates30) {
        if (hasLogOnDate(logs, d)) {
          completed++;
        }
      }
      totalCompleted30 += completed / 30;
    }
    const monthlyScore = Math.round((totalCompleted30 / habitsList.length) * 100);

    // Generate insights
    const insights: string[] = [];
    const strongestHabit = Object.keys(habitsStats).reduce((a, b) =>
      habitsStats[a].streak > habitsStats[b].streak ? a : b
    );
    const weakHabit = Object.keys(habitsStats).reduce((a, b) =>
      habitsStats[a].completionRate < habitsStats[b].completionRate ? a : b
    );

    if (habitsStats[strongestHabit].streak > 2) {
      insights.push(
        `Great job! Your strongest habit is ${strongestHabit.replace('_', ' ')} with a ${
          habitsStats[strongestHabit].streak
        }-day streak.`
      );
    }
    if (habitsStats[weakHabit].completionRate < 0.5) {
      insights.push(
        `Focus on building your ${weakHabit.replace('_', ' ')} habit. You've hit it on less than half of your days recently.`
      );
    } else {
      insights.push('All habits are looking solid! Keep maintaining your logging consistency.');
    }

    if (habitsStats.water.streak > 3) {
      insights.push('Your hydration habits are excellent. Keep taking regular sips!');
    }

    return {
      habits: Object.keys(habitsStats).map(name => ({
        name,
        streak: habitsStats[name].streak,
        completionRate: habitsStats[name].completionRate,
        targetFrequency: habitsStats[name].targetFrequency,
      })),
      weeklyScore,
      monthlyScore,
      completionPercentage: weeklyScore,
      insights,
    };
  }
}
export default HabitEngine;
