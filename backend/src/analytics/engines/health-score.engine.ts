import { Injectable } from '@nestjs/common';
import { AnalyticsHealthScoreResponse } from '../../../../shared/contracts/analytics';

export interface HealthScoreInputs {
  bmi: number;
  activityLevel: string;
  waterAdherence: number; // 0-100
  calorieAdherence: number; // 0-100
  bodyFatPercentage?: number | null;
  gender: string;
  sleepHours: number;
  workoutDays: number;
  consistencyScore: number; // 0-100
  reminderAdherence?: number; // 0-100
  history: { date: Date; score: number }[];
}

@Injectable()
export class HealthScoreEngine {
  calculateScore(inputs: HealthScoreInputs): AnalyticsHealthScoreResponse {
    const {
      activityLevel,
      waterAdherence,
      calorieAdherence,
      bodyFatPercentage,
      gender,
      sleepHours,
      workoutDays,
      consistencyScore,
      reminderAdherence = 85,
      history,
    } = inputs;

    // 1. Nutrition Score (0-100)
    // Combine Calorie Adherence (50%) + Water Adherence (50%)
    const nutrition = Math.round(calorieAdherence * 0.5 + waterAdherence * 0.5);

    // 2. Activity Score (0-100)
    // Activity level mapping (sedentary: 40, light: 60, moderate: 80, very_active/athlete: 100)
    let actBase = 40;
    const act = activityLevel.toLowerCase();
    if (act.includes('athlete') || act.includes('very_active')) actBase = 100;
    else if (act.includes('mod')) actBase = 80;
    else if (act.includes('light')) actBase = 60;

    // Workout days contribution (e.g. 4+ days = 100, 3 days = 85, 2 days = 70, 1 day = 50, 0 = 30)
    let workoutBonus = 30;
    if (workoutDays >= 4) workoutBonus = 100;
    else if (workoutDays === 3) workoutBonus = 85;
    else if (workoutDays === 2) workoutBonus = 70;
    else if (workoutDays === 1) workoutBonus = 50;

    const activity = Math.round(actBase * 0.5 + workoutBonus * 0.5);

    // 3. Sleep Score (0-100)
    let sleep = 40;
    if (sleepHours >= 7 && sleepHours <= 9) sleep = 100;
    else if (sleepHours === 6 || sleepHours === 10) sleep = 80;
    else if (sleepHours === 5 || sleepHours === 11) sleep = 60;

    // 4. Consistency Score (0-100)
    const consistency = Math.round(consistencyScore);

    // Overall Score: Weighted average including reminderAdherence
    const score = Math.round(
      nutrition * 0.35 +
      activity * 0.3 +
      sleep * 0.15 +
      consistency * 0.1 +
      reminderAdherence * 0.1
    );

    const formattedHistory = history.map((h) => ({
      date: h.date.toISOString().split('T')[0],
      score: Math.round(h.score),
    }));

    return {
      score,
      breakdown: {
        nutrition,
        activity,
        sleep,
        consistency,
      },
      history: formattedHistory,
    };
  }
}
export default HealthScoreEngine;
