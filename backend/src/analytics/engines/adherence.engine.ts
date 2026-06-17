import { Injectable } from '@nestjs/common';
import { AdherenceScoreResponse } from '../../../../shared/contracts/analytics';

@Injectable()
export class AdherenceEngine {
  calculateAdherence(
    logs: {
      caloriesConsumed: number;
      caloriesTarget: number;
      proteinConsumed: number;
      proteinTarget: number;
      carbsConsumed: number;
      carbsTarget: number;
      fatsConsumed: number;
      fatsTarget: number;
      waterConsumed: number; // ml
      waterTarget: number; // liters (converted to ml or vice-versa)
    }[]
  ): AdherenceScoreResponse {
    if (logs.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, overall: 0 };
    }

    let totalCal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalWater = 0;

    logs.forEach((log) => {
      // Calorie adherence
      const calTarget = log.caloriesTarget || 2000;
      const calDiff = Math.abs(log.caloriesConsumed - calTarget);
      const calAdh = Math.max(0, 100 - (calDiff / calTarget) * 100);
      totalCal += calAdh;

      // Protein adherence
      const protTarget = log.proteinTarget || 130;
      const protDiff = Math.abs(log.proteinConsumed - protTarget);
      const protAdh = Math.max(0, 100 - (protDiff / protTarget) * 100);
      totalProt += protAdh;

      // Carbs adherence
      const carbsTarget = log.carbsTarget || 220;
      const carbsDiff = Math.abs(log.carbsConsumed - carbsTarget);
      const carbsAdh = Math.max(0, 100 - (carbsDiff / carbsTarget) * 100);
      totalCarbs += carbsAdh;

      // Fats adherence
      const fatsTarget = log.fatsTarget || 70;
      const fatsDiff = Math.abs(log.fatsConsumed - fatsTarget);
      const fatsAdh = Math.max(0, 100 - (fatsDiff / fatsTarget) * 100);
      totalFats += fatsAdh;

      // Water adherence (convert target in liters to ml: target * 1000)
      const waterTargetMl = (log.waterTarget || 2.5) * 1000;
      const waterAdh = Math.min(100, (log.waterConsumed / (waterTargetMl || 1)) * 100);
      totalWater += waterAdh;
    });

    const days = logs.length;
    const calories = Math.round(totalCal / days);
    const protein = Math.round(totalProt / days);
    const carbs = Math.round(totalCarbs / days);
    const fats = Math.round(totalFats / days);
    const water = Math.round(totalWater / days);

    // Weighted average overall score
    const overall = Math.round(calories * 0.4 + protein * 0.3 + water * 0.15 + (carbs + fats) * 0.075);

    return { calories, protein, carbs, fats, water, overall };
  }
}
export default AdherenceEngine;
