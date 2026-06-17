import { Injectable } from '@nestjs/common';

export interface CompensationInputs {
  totalSurplusCalories: number;
  maintenanceCalories: number;
  gender: string; // 'male' | 'female' | 'other'
  weight: number; // in kg
  baseProtein: number; // in grams
  baseCarbs: number;
  baseFats: number;
  baseWater: number; // in liters
}

@Injectable()
export class CompensationEngine {
  calculateCompensation(inputs: CompensationInputs) {
    const {
      totalSurplusCalories,
      maintenanceCalories,
      gender,
      weight,
      baseProtein,
      baseCarbs,
      baseFats,
      baseWater,
    } = inputs;

    // 1. Deficit Safety Floor: 1200 kcal for women / 1500 kcal for men (default 1500)
    const safetyFloor = gender.toLowerCase() === 'female' ? 1200 : 1500;

    // 2. Safe daily calorie deficit: max 20% of maintenance
    const maxSafeDeficit = Math.round(maintenanceCalories * 0.20);
    
    // We must ensure targetCalories = maintenance - deficit >= safetyFloor
    // So maximum allowed deficit = maintenance - safetyFloor
    const maxAllowedDeficit = Math.max(0, maintenanceCalories - safetyFloor);
    const dailyDeficit = Math.min(maxSafeDeficit, maxAllowedDeficit);

    // If daily deficit is too small (e.g. maintenance is already below safetyFloor),
    // we compensate through activity only. We use a virtual calorie reduction for calculations.
    const effectiveDailyReduction = dailyDeficit > 0 ? dailyDeficit : 250; // virtual 250 kcal/day offset by walking/cardio

    // Determine recovery duration
    let recoveryDays = 1;
    if (totalSurplusCalories > 0) {
      recoveryDays = Math.ceil(totalSurplusCalories / effectiveDailyReduction);
      // Cap recovery days to a reasonable duration (e.g. 14 days) to prevent eternal dieting
      recoveryDays = Math.min(14, Math.max(2, recoveryDays));
    }

    // Actual daily reduction calories to recommend
    const dailyReductionCalories = totalSurplusCalories > 0 
      ? Math.round(totalSurplusCalories / recoveryDays)
      : 0;
    
    // Calorie target for recovery days
    const recoveryCalorieTarget = Math.max(safetyFloor, Math.round(maintenanceCalories - Math.min(dailyReductionCalories, dailyDeficit)));

    // 3. Recommended Walking Target
    // 10,000 steps base, +1,000 steps per 300 kcal surplus, cap at 15,000
    const stepsIncrease = Math.min(5000, Math.ceil(totalSurplusCalories / 300) * 1000);
    const recommendedSteps = 10000 + stepsIncrease;
    // 30 min base + 5 min per 500 kcal surplus
    const recommendedWalkingMinutes = Math.min(60, 30 + Math.ceil(totalSurplusCalories / 500) * 5);

    // 4. Cardio Target (minutes/sessions over the plan)
    // 30 mins cardio session per 1000 kcal surplus, max 4 sessions
    const recommendedCardioMinutes = totalSurplusCalories > 0
      ? Math.min(120, Math.ceil(totalSurplusCalories / 1000) * 30)
      : 0;

    // 5. Strength Sessions Target
    // Recommend 2-4 sessions depending on recoveryDays
    const recommendedStrengthSessions = Math.min(4, Math.max(1, Math.ceil(recoveryDays / 3)));

    // 6. Macro redistribution: Higher protein for satiety and muscle sparing.
    // Set protein to 2.0g per kg of body weight, or baseProtein + 15g, whichever is higher
    const proteinTarget = Math.round(Math.max(baseProtein + 15, weight * 2.0));
    
    // Distribute remaining calories to Carbs and Fats (e.g. 50% carbs, 50% fats or keep base ratio)
    const proteinCalories = proteinTarget * 4;
    const remainingCalories = Math.max(0, recoveryCalorieTarget - proteinCalories);
    
    // Baseline ratio of carbs/fats
    const baseCarbCalories = baseCarbs * 4;
    const baseFatCalories = baseFats * 9;
    const baseCarbFatRatio = baseCarbCalories / (baseCarbCalories + baseFatCalories || 1);

    const recoveryCarbCalories = remainingCalories * baseCarbFatRatio;
    const recoveryFatCalories = remainingCalories * (1 - baseCarbFatRatio);

    const carbsTarget = Math.round(recoveryCarbCalories / 4);
    const fatsTarget = Math.round(recoveryFatCalories / 9);

    // 7. Hydration increase (flush out water retention): +500ml (0.5L)
    const waterTarget = Math.round((baseWater + 0.5) * 10) / 10;

    return {
      totalSurplusCalories: Math.round(totalSurplusCalories),
      dailyReductionCalories: Math.round(dailyReductionCalories),
      recoveryDays,
      recoveryCalorieTarget,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      waterTarget,
      recommendedSteps,
      recommendedWalkingMinutes,
      recommendedCardioMinutes,
      recommendedStrengthSessions,
    };
  }
}
export default CompensationEngine;
