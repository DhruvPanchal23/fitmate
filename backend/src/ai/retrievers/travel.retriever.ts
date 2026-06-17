import { Injectable } from '@nestjs/common';
import { TravelService } from '../../travel/travel.service';

@Injectable()
export class TravelRetriever {
  constructor(private readonly travelService: TravelService) {}

  async retrieve(userId: string) {
    try {
      const activeSession = await this.travelService.getActiveSession(userId);
      const recoveryPlan = await this.travelService.getRecoveryPlan(userId);

      return {
        active: !!activeSession,
        destination: activeSession?.destination || null,
        timezone: activeSession?.timezone || null,
        purpose: activeSession?.purpose || null,
        startDate: activeSession?.startDate || null,
        liveSurplus: activeSession?.liveSurplus || 0,
        
        hasRecoveryPlan: !!recoveryPlan,
        recoveryPlan: recoveryPlan ? {
          totalSurplusCalories: recoveryPlan.plan.totalSurplusCalories,
          dailyReductionCalories: recoveryPlan.plan.dailyReductionCalories,
          recoveryDays: recoveryPlan.plan.recoveryDays,
          currentDayNumber: recoveryPlan.currentDayNumber,
          percentage: recoveryPlan.percentage,
          status: recoveryPlan.plan.status,
          todayTarget: recoveryPlan.todayTarget,
        } : null,
      };
    } catch (e) {
      return {
        active: false,
        destination: null,
        timezone: null,
        purpose: null,
        startDate: null,
        liveSurplus: 0,
        hasRecoveryPlan: false,
        recoveryPlan: null,
      };
    }
  }
}
export default TravelRetriever;

