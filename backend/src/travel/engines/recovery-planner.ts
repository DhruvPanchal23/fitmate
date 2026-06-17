import { Injectable } from '@nestjs/common';
import { RecoveryDayResponse } from '../../../../shared/contracts/travel-compensation';

export interface PlannerInputs {
  recoveryDays: number;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  recommendedSteps: number;
  recommendedWalkingMinutes: number;
  recommendedCardioMinutes: number;
  recommendedStrengthSessions: number;
}

@Injectable()
export class RecoveryPlanner {
  generateSchedule(inputs: PlannerInputs): RecoveryDayResponse[] {
    const {
      recoveryDays,
      caloriesTarget,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      recommendedSteps,
      recommendedWalkingMinutes,
      recommendedCardioMinutes,
      recommendedStrengthSessions,
    } = inputs;

    const schedule: RecoveryDayResponse[] = [];

    // Distribute cardio minutes and strength sessions across recoveryDays
    let remainingCardio = recommendedCardioMinutes;
    let remainingStrength = recommendedStrengthSessions;

    for (let day = 1; day <= recoveryDays; day++) {
      const activities: string[] = [];
      let dayCardio = 0;
      let dayStrength = 0;

      // Logic to cycle activities
      if (day % 3 === 1) {
        // Walking & steps focus
        activities.push(`${recommendedWalkingMinutes} min incline walking`);
        activities.push(`Focus on high-satiety foods`);
      } else if (day % 3 === 2 && remainingStrength > 0) {
        // Strength focus
        dayStrength = 1;
        remainingStrength--;
        activities.push('Strength training session (e.g., Upper/Lower split)');
        activities.push('Prioritize protein post-workout');
      } else if (remainingCardio > 0) {
        // Cardio focus
        // Allocate 30 mins cardio if remaining
        dayCardio = Math.min(30, remainingCardio);
        remainingCardio -= dayCardio;
        activities.push(`${dayCardio} min moderate-intensity cardio`);
        activities.push('Hydrate with extra electrolytes');
      } else {
        // Rest / Recovery focus
        activities.push('Active recovery & stretching');
        activities.push('Hydration and rest focus');
      }

      schedule.push({
        dayNumber: day,
        caloriesTarget: Math.round(caloriesTarget),
        proteinTarget: Math.round(proteinTarget),
        carbsTarget: Math.round(carbsTarget),
        fatsTarget: Math.round(fatsTarget),
        recommendedSteps: Math.round(recommendedSteps),
        recommendedWalkingMinutes: day % 3 === 1 ? Math.round(recommendedWalkingMinutes) : 30, // baseline walking
        recommendedCardioMinutes: dayCardio,
        recommendedStrengthSessions: dayStrength,
        activities,
      });
    }

    return schedule;
  }
}
export default RecoveryPlanner;
