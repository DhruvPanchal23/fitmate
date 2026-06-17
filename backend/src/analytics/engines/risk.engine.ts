import { Injectable } from '@nestjs/common';
import { RiskAlertResponse } from '../../../../shared/contracts/analytics';

@Injectable()
export class RiskEngine {
  analyzeRisk(params: {
    caloriesConsumed: number;
    caloriesTarget: number;
    proteinConsumed: number;
    weight: number;
    gender: string;
    recentWeightLossKg: number; // weight loss in the last 7 days
  }): RiskAlertResponse[] {
    const { caloriesConsumed, caloriesTarget, proteinConsumed, weight, gender, recentWeightLossKg } = params;
    const alerts: RiskAlertResponse[] = [];

    const calorieRatio = caloriesTarget > 0 ? caloriesConsumed / caloriesTarget : 1;
    const proteinPerKg = weight > 0 ? proteinConsumed / weight : 0;
    const safetyFloor = gender.toLowerCase() === 'female' ? 1200 : 1500;

    // 1. Under-eating Risk
    if (caloriesConsumed > 0 && (caloriesConsumed < safetyFloor || calorieRatio < 0.65)) {
      alerts.push({
        type: 'under_eating',
        riskLevel: caloriesConsumed < safetyFloor - 200 ? 'high' : 'medium',
        description: `Your daily intake (${caloriesConsumed} kcal) is critically low. Eating below ${safetyFloor} kcal can impact metabolic health.`,
      });
    }

    // 2. Muscle Loss Risk
    // High risk if losing weight quickly (> 1kg/week) and protein is low (< 1.4g/kg)
    if (recentWeightLossKg > 0.8 && proteinPerKg < 1.4) {
      alerts.push({
        type: 'muscle_loss',
        riskLevel: proteinPerKg < 1.0 ? 'high' : 'medium',
        description: `Fast weight loss (${recentWeightLossKg} kg this week) and low protein (${proteinPerKg.toFixed(1)}g/kg) increases risk of muscle loss.`,
      });
    }

    // 3. Over-eating Risk
    if (calorieRatio > 1.35) {
      alerts.push({
        type: 'over_eating',
        riskLevel: calorieRatio > 1.5 ? 'high' : 'medium',
        description: `Calorie intake is ${Math.round((calorieRatio - 1) * 100)}% above your goal. This might delay your progress.`,
      });
    }

    return alerts;
  }
}
export default RiskEngine;
