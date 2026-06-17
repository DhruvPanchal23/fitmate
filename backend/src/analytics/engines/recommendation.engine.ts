import { Injectable } from '@nestjs/common';
import { RecommendationResponse } from '../../../../shared/contracts/analytics';

@Injectable()
export class RecommendationEngine {
  generateRecommendations(params: {
    averageWaterLiters: number;
    waterTargetLiters: number;
    averageSteps: number;
    averageProteinGrams: number;
    targetProteinGrams: number;
    sleepHours: number;
    plateauDetected: boolean;
  }): RecommendationResponse[] {
    const {
      averageWaterLiters,
      waterTargetLiters,
      averageSteps,
      averageProteinGrams,
      targetProteinGrams,
      sleepHours,
      plateauDetected,
    } = params;

    const recommendations: RecommendationResponse[] = [];

    // 1. Hydration recommendation
    if (averageWaterLiters < waterTargetLiters * 0.8) {
      recommendations.push({
        id: 'rec-hydration-' + Date.now(),
        title: 'Increase Hydration',
        description: `Your average hydration (${averageWaterLiters.toFixed(1)}L) is below target (${waterTargetLiters.toFixed(1)}L). Drink 2 extra glasses of water.`,
        type: 'hydration',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Activity recommendation
    if (averageSteps < 7000) {
      recommendations.push({
        id: 'rec-activity-' + Date.now(),
        title: 'Increase Daily Steps',
        description: `Average steps (${averageSteps.toLocaleString()}) are below healthy bounds. Aim for a 15-minute brisk walk today.`,
        type: 'exercise',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Protein recommendation
    if (averageProteinGrams < targetProteinGrams * 0.8) {
      recommendations.push({
        id: 'rec-nutrition-' + Date.now(),
        title: 'Prioritize Protein Sources',
        description: `Average protein (${averageProteinGrams}g) is below target (${targetProteinGrams}g). Add Greek yogurt, eggs, or tofu to your meals.`,
        type: 'nutrition',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Sleep recommendation
    if (sleepHours < 7) {
      recommendations.push({
        id: 'rec-sleep-' + Date.now(),
        title: 'Optimize Sleep Hygiene',
        description: `You are averaging ${sleepHours} hours of sleep. Aim for 7-8 hours to improve muscle recovery and insulin sensitivity.`,
        type: 'sleep',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Plateau recommendation
    if (plateauDetected) {
      recommendations.push({
        id: 'rec-plateau-' + Date.now(),
        title: 'Break Your Plateau',
        description: 'Your weight progress has stalled. Try a structured calorie refeed day or add 15 minutes of low-intensity cardio.',
        type: 'nutrition',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Default recommendation if everything is optimal
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-success-' + Date.now(),
        title: 'Maintain Consistency',
        description: 'You are hitting all targets. Keep up the high adherence to lock in your long-term results.',
        type: 'nutrition',
        implemented: false,
        createdAt: new Date().toISOString(),
      });
    }

    return recommendations;
  }
}
export default RecommendationEngine;
