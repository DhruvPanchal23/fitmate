import { Injectable } from '@nestjs/common';
import { SmartGoalsResponse } from '../../../shared/contracts/goals';

@Injectable()
export class HealthScoreService {
  calculateHealthScore(params: {
    bmi: number;
    activityLevel: string;
    todayWaterLogged: number; // in liters
    waterTarget: number;       // in liters
    todayCaloriesLogged: number;
    caloriesTarget: number;
    bodyFatPercentage?: number | null;
    gender: string;
    sleepHours: number;
    workoutDays: number;
  }) {
    const {
      bmi,
      activityLevel,
      todayWaterLogged,
      waterTarget,
      todayCaloriesLogged,
      caloriesTarget,
      bodyFatPercentage,
      gender,
      sleepHours,
      workoutDays,
    } = params;

    // 1. BMI Score (20 points)
    let bmiScore = 6;
    if (bmi >= 18.5 && bmi <= 24.9) {
      bmiScore = 20;
    } else if ((bmi >= 25 && bmi <= 29.9) || (bmi >= 17 && bmi < 18.5)) {
      bmiScore = 12;
    }

    // 2. Activity Level Score (15 points)
    let activityScore = 4;
    const act = activityLevel.toLowerCase();
    if (act === 'athlete' || act === 'active') {
      activityScore = 15;
    } else if (act === 'moderate') {
      activityScore = 12;
    } else if (act === 'light') {
      activityScore = 8;
    }

    // 3. Hydration Score (15 points)
    let hydrationAdherenceScore = 0;
    if (waterTarget > 0) {
      const ratio = todayWaterLogged / waterTarget;
      hydrationAdherenceScore = Math.min(15, Math.round(ratio * 15));
    }

    // 4. Macro/Calorie Adherence Score (15 points)
    let macroAdherenceScore = 5;
    if (todayCaloriesLogged > 0 && caloriesTarget > 0) {
      const dev = Math.abs(todayCaloriesLogged - caloriesTarget) / caloriesTarget;
      if (dev <= 0.08) {
        macroAdherenceScore = 15;
      } else if (dev <= 0.18) {
        macroAdherenceScore = 10;
      }
    } else if (todayCaloriesLogged === 0) {
      macroAdherenceScore = 0; // No logs today
    }

    // 5. Body Fat Score (10 points)
    let bodyFatScore = 8; // Default if not provided
    if (bodyFatPercentage !== undefined && bodyFatPercentage !== null) {
      const isMale = gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm';
      if (isMale) {
        if (bodyFatPercentage >= 8 && bodyFatPercentage <= 19) {
          bodyFatScore = 10;
        } else if (bodyFatPercentage >= 20 && bodyFatPercentage <= 25) {
          bodyFatScore = 7;
        } else {
          bodyFatScore = 4;
        }
      } else {
        if (bodyFatPercentage >= 15 && bodyFatPercentage <= 27) {
          bodyFatScore = 10;
        } else if (bodyFatPercentage >= 28 && bodyFatPercentage <= 33) {
          bodyFatScore = 7;
        } else {
          bodyFatScore = 4;
        }
      }
    }

    // 6. Sleep Score (15 points)
    let sleepScore = 5;
    if (sleepHours >= 7 && sleepHours <= 9) {
      sleepScore = 15;
    } else if ((sleepHours >= 6 && sleepHours < 7) || (sleepHours > 9 && sleepHours <= 10)) {
      sleepScore = 10;
    }

    // 7. Workout Score (10 points)
    let workoutScore = 1;
    if (workoutDays >= 4) {
      workoutScore = 10;
    } else if (workoutDays >= 2) {
      workoutScore = 7;
    } else if (workoutDays >= 1) {
      workoutScore = 4;
    }

    const healthScore =
      bmiScore +
      activityScore +
      hydrationAdherenceScore +
      macroAdherenceScore +
      bodyFatScore +
      sleepScore +
      workoutScore;

    // Generate Recommendations
    const recommendations: string[] = [];
    if (bmiScore < 20) {
      recommendations.push(
        bmi < 18.5
          ? 'Focus on lean mass nutrition to reach a healthy weight range.'
          : 'Consider a mild caloric deficit and portion control to optimize your BMI.'
      );
    }
    if (activityScore <= 8) {
      recommendations.push('Try to schedule at least 30 minutes of light cardio or walking daily.');
    }
    if (hydrationAdherenceScore < 10) {
      recommendations.push('Hydration is low. Keep a water bottle nearby and log your fluid intake.');
    }
    if (sleepScore < 15) {
      recommendations.push('Prioritize 7-8 hours of sleep per night to maximize muscle recovery and hormonal balance.');
    }
    if (workoutScore < 7) {
      recommendations.push('Aim for at least 2-3 resistance training or workout sessions per week.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! All health parameters are in optimal ranges. Keep it up!');
    }

    return {
      healthScore,
      breakdown: {
        bmiScore,
        activityScore,
        hydrationAdherenceScore,
        macroAdherenceScore,
        bodyFatScore,
        sleepScore,
        workoutScore,
      },
      recommendations,
    };
  }
}
export default HealthScoreService;
