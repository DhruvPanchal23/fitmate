import { Injectable } from '@nestjs/common';
import { AnalyticsPredictionsResponse } from '../../../../shared/contracts/analytics';

@Injectable()
export class PredictionEngine {
  predict(
    currentWeight: number,
    targetWeight: number,
    weeklyLogs: { caloriesConsumed: number; caloriesTarget: number }[],
    weightHistory: { date: Date; weight: number }[]
  ): AnalyticsPredictionsResponse {
    // 1. Calculate Average Calorie Balance (consumed vs maintenance)
    // We assume 7700 kcal = 1 kg of body mass
    let totalBalance = 0;
    weeklyLogs.forEach((log) => {
      // Net surplus/deficit relative to target (or assume target matches goals)
      const target = log.caloriesTarget || 2000;
      totalBalance += log.caloriesConsumed - target;
    });

    const averageDailyBalance = weeklyLogs.length > 0 ? totalBalance / weeklyLogs.length : 0;
    
    // Weight change in 30 days: (avgDailyBalance * 30) / 7700
    const weightChange30Days = (averageDailyBalance * 30) / 7700;
    const predictedWeight30Days = Math.round((currentWeight + weightChange30Days) * 10) / 10;

    // 2. Goal completion date
    let predictedGoalCompletionDate: string | null = null;
    const weightDiff = targetWeight - currentWeight;

    if (Math.abs(weightDiff) > 0.1 && Math.abs(averageDailyBalance) > 50) {
      // If losing weight, balance should be negative. If gaining, balance should be positive.
      const dailyWeightChange = averageDailyBalance / 7700; // kg/day
      
      // Ensure the direction of change matches the goal
      if ((weightDiff > 0 && dailyWeightChange > 0) || (weightDiff < 0 && dailyWeightChange < 0)) {
        const daysToGoal = Math.ceil(weightDiff / dailyWeightChange);
        if (daysToGoal > 0 && daysToGoal < 365) {
          const completionDate = new Date();
          completionDate.setDate(completionDate.getDate() + daysToGoal);
          predictedGoalCompletionDate = completionDate.toISOString();
        }
      }
    }

    // 3. Plateau detection
    // If weight has stayed within a 0.2kg boundary for more than 10 days despite a deficit/surplus
    let plateauDetected = false;
    let plateauDurationDays = 0;

    if (weightHistory.length >= 4) {
      const sortedWeights = [...weightHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
      const latest = sortedWeights[0].weight;
      
      let allClose = true;
      let durationDays = 0;
      for (let i = 1; i < Math.min(sortedWeights.length, 10); i++) {
        const diff = Math.abs(sortedWeights[i].weight - latest);
        if (diff > 0.25) {
          allClose = false;
          break;
        }
        durationDays = Math.ceil((sortedWeights[0].date.getTime() - sortedWeights[i].date.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (allClose && durationDays >= 10) {
        plateauDetected = true;
        plateauDurationDays = durationDays;
      }
    }

    return {
      predictedWeight30Days,
      predictedGoalCompletionDate,
      plateauDetected,
      plateauDurationDays,
    };
  }
}
export default PredictionEngine;
