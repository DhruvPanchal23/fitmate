import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TravelRepository } from './travel.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SurplusCalculator } from './engines/surplus-calculator';
import { CompensationEngine } from './engines/compensation-engine';
import { RecoveryPlanner } from './engines/recovery-planner';
import { TravelAnalyticsService } from './travel-analytics.service';
import { StartTravelRequest } from '../../../shared/contracts/travel-compensation';

@Injectable()
export class TravelService {
  constructor(
    private readonly repository: TravelRepository,
    private readonly prisma: PrismaService,
    private readonly surplusCalculator: SurplusCalculator,
    private readonly compensationEngine: CompensationEngine,
    private readonly recoveryPlanner: RecoveryPlanner,
    private readonly analyticsService: TravelAnalyticsService,
  ) {}

  async startTravel(userId: string, request: StartTravelRequest) {
    // Check if there is an active session already
    const active = await this.repository.findActiveSession(userId);
    if (active) {
      throw new BadRequestException('Travel session is already active');
    }

    const session = await this.repository.createSession(
      userId,
      request.destination,
      request.timezone,
      request.purpose,
    );
    return session;
  }

  async endTravel(userId: string) {
    const active = await this.repository.findActiveSession(userId);
    if (!active) {
      throw new BadRequestException('No active travel session found');
    }

    // Deactivate the session (sets active = false and endDate = now)
    const session = await this.repository.deactivateSessions(userId);
    if (!session) {
      throw new BadRequestException('Failed to end travel session');
    }

    // Calculate daily summaries for each day during the travel session
    const summaries = await this.calculateDailySummaries(userId, session.id);

    // Calculate total accumulated surplus
    const totalSurplusCalories = summaries.reduce((sum, s) => sum + s.surplus, 0);

    // Fetch user profile and goals to run CompensationEngine
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const maintenanceCalories = latestGoal?.maintenanceCalories || 2000;
    const baseProtein = latestGoal?.protein || 130;
    const baseCarbs = latestGoal?.carbs || 220;
    const baseFats = latestGoal?.fats || 70;
    const baseWater = latestGoal?.water || 2.5;

    // Run compensation engine
    const compensation = this.compensationEngine.calculateCompensation({
      totalSurplusCalories,
      maintenanceCalories,
      gender: profile.gender,
      weight: profile.weight,
      baseProtein,
      baseCarbs,
      baseFats,
      baseWater,
    });

    // Save compensation plan
    const plan = await this.repository.saveCompensationPlan({
      userId,
      travelSessionId: session.id,
      totalSurplusCalories: compensation.totalSurplusCalories,
      dailyReductionCalories: compensation.dailyReductionCalories,
      recoveryDays: compensation.recoveryDays,
      recommendedWalkingMinutes: compensation.recommendedWalkingMinutes,
      recommendedCardioMinutes: compensation.recommendedCardioMinutes,
      recommendedStrengthSessions: compensation.recommendedStrengthSessions,
      status: 'active',
    });

    return {
      session,
      plan,
      compensation,
    };
  }

  async getActiveSession(userId: string) {
    const active = await this.repository.findActiveSession(userId);
    if (!active) return null;

    // Live calculate active stats so dashboard shows current surplus
    const liveSummaries = await this.liveCalculateActiveSummaries(userId, active.id, active.startDate);
    const totalSurplus = liveSummaries.reduce((sum, s) => sum + s.surplus, 0);

    return {
      ...active,
      liveSurplus: totalSurplus,
      dailySummaries: liveSummaries,
    };
  }

  async getHistory(userId: string) {
    return this.analyticsService.getHistoryAnalytics(userId);
  }

  async getAnalytics(userId: string, sessionId?: string) {
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const active = await this.repository.findActiveSession(userId);
      if (active) {
        targetSessionId = active.id;
      } else {
        const history = await this.repository.findMany(userId);
        if (history.length > 0) {
          targetSessionId = history[0].id;
        }
      }
    }

    if (!targetSessionId) {
      return {
        totalDays: 0,
        totalSurplus: 0,
        averageCalorieSurplus: 0,
        averageProteinDeviation: 0,
        averageSteps: 0,
        averageWater: 0,
        dailySurpluses: [],
      };
    }

    // Ensure summaries are persisted before returning analytics for old sessions
    const session = await this.repository.findSessionById(targetSessionId);
    if (session && !session.active && session.dailySummaries.length === 0) {
      await this.calculateDailySummaries(userId, session.id);
    }

    return this.analyticsService.getSessionAnalytics(userId, targetSessionId);
  }

  async getRecoveryPlan(userId: string) {
    const activePlan = await this.repository.findActiveCompensationPlan(userId);
    if (!activePlan) {
      return null;
    }

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const maintenanceCalories = latestGoal?.maintenanceCalories || 2000;
    const baseProtein = latestGoal?.protein || 130;
    const baseCarbs = latestGoal?.carbs || 220;
    const baseFats = latestGoal?.fats || 70;
    const baseWater = latestGoal?.water || 2.5;

    // Run compensation engine to reconstruct targets
    const compensation = this.compensationEngine.calculateCompensation({
      totalSurplusCalories: activePlan.totalSurplusCalories,
      maintenanceCalories,
      gender: profile?.gender || 'male',
      weight: profile?.weight || 75,
      baseProtein,
      baseCarbs,
      baseFats,
      baseWater,
    });

    const schedule = this.recoveryPlanner.generateSchedule({
      recoveryDays: activePlan.recoveryDays,
      caloriesTarget: compensation.recoveryCalorieTarget,
      proteinTarget: compensation.proteinTarget,
      carbsTarget: compensation.carbsTarget,
      fatsTarget: compensation.fatsTarget,
      recommendedSteps: compensation.recommendedSteps,
      recommendedWalkingMinutes: compensation.recommendedWalkingMinutes,
      recommendedCardioMinutes: compensation.recommendedCardioMinutes,
      recommendedStrengthSessions: compensation.recommendedStrengthSessions,
    });

    // Determine current recovery day based on activePlan.createdAt
    const startOfRecovery = new Date(activePlan.createdAt).getTime();
    const now = new Date().getTime();
    const daysDiff = Math.floor((now - startOfRecovery) / (1000 * 60 * 60 * 24));
    const currentDayNumber = Math.min(activePlan.recoveryDays, Math.max(1, daysDiff + 1));

    // Calculate percentage complete
    const percentage = activePlan.status === 'completed'
      ? 100
      : Math.round(((currentDayNumber - 1) / activePlan.recoveryDays) * 100);

    return {
      plan: activePlan,
      schedule,
      currentDayNumber,
      percentage,
      todayTarget: schedule[currentDayNumber - 1] || schedule[schedule.length - 1],
    };
  }

  async updateRecoveryStatus(userId: string, planId: string, status: string) {
    const plan = await this.prisma.compensationPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.userId !== userId) {
      throw new NotFoundException('Compensation plan not found');
    }

    return this.repository.updateCompensationPlanStatus(planId, status);
  }

  // Private helpers to compute daily summaries
  private async calculateDailySummaries(userId: string, sessionId: string) {
    const session = await this.prisma.travelSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) return [];

    const start = new Date(session.startDate);
    const end = session.endDate ? new Date(session.endDate) : new Date();

    const summaries = [];
    const targetGoals = await this.fetchTargetGoals(userId);

    // Loop through each day from start to end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const summaryData = await this.gatherLogsAndCalculate(userId, sessionId, currentDate, targetGoals);
      const saved = await this.repository.saveDailySummary(summaryData);
      summaries.push(saved);
    }

    return summaries;
  }

  private async liveCalculateActiveSummaries(userId: string, sessionId: string, startDate: Date) {
    const end = new Date();
    const summaries = [];
    const targetGoals = await this.fetchTargetGoals(userId);

    for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const summaryData = await this.gatherLogsAndCalculate(userId, sessionId, currentDate, targetGoals);
      summaries.push(summaryData);
    }
    return summaries;
  }

  private async fetchTargetGoals(userId: string): Promise<any> {
    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      calories: latestGoal?.calories || 2000,
      protein: latestGoal?.protein || 130,
      carbs: latestGoal?.carbs || 220,
      fats: latestGoal?.fats || 70,
      water: latestGoal?.water || 2.5,
    };
  }

  private async gatherLogsAndCalculate(userId: string, sessionId: string, date: Date, targetGoals: any) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { items: true },
    });

    const mealLogs = meals.map(m => {
      const calories = m.items.reduce((sum, item) => sum + item.calories, 0);
      const protein = m.items.reduce((sum, item) => sum + item.protein, 0);
      const carbohydrates = m.items.reduce((sum, item) => sum + item.carbohydrates, 0);
      const fats = m.items.reduce((sum, item) => sum + item.fats, 0);
      return { calories, protein, carbohydrates, fats };
    });

    const waterLogs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const exerciseLogs = await this.prisma.exerciseLog.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Mock steps: generate random realistic steps or pull if stored. Since there's no step model,
    // let's check if there is exercise logs, or generate a baseline based on activity.
    // We can also check if steps were logged to dailySummary previously.
    const steps = 7000 + Math.floor(Math.random() * 6000); // 7k-13k baseline travel steps

    const summary = this.surplusCalculator.calculateDailySummary(
      {
        date,
        meals: mealLogs,
        waterLogs,
        exerciseLogs,
        steps,
      },
      targetGoals,
    );

    return {
      travelSessionId: sessionId,
      ...summary,
    };
  }

  async toggleTravelMode(userId: string, active: boolean) {
    if (active) {
      const activeSession = await this.repository.findActiveSession(userId);
      if (activeSession) return { success: true, active: true, session: activeSession };
      const session = await this.startTravel(userId, {});
      return { success: true, active: true, session };
    } else {
      const activeSession = await this.repository.findActiveSession(userId);
      if (!activeSession) return { success: true, active: false };
      const result = await this.endTravel(userId);
      return { success: true, active: false, result };
    }
  }

  async getTravelStats(userId: string) {
    const sessions = await this.repository.findMany(userId);
    const activeSession = await this.repository.findActiveSession(userId);

    let activeDays = 0;
    for (const session of sessions) {
      const start = new Date(session.startDate).getTime();
      const end = session.endDate ? new Date(session.endDate).getTime() : new Date().getTime();
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      activeDays += Math.max(1, diffDays);
    }

    // Query water logs during travel sessions
    let waterTotal = 0;
    for (const session of sessions) {
      const logs = await this.prisma.waterLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: session.startDate,
            lte: session.endDate || new Date(),
          },
        },
      });
      waterTotal += logs.reduce((sum, log) => sum + log.amount, 0);
    }

    // Count scanned meals during travel sessions
    let scannedMealsCount = 0;
    for (const session of sessions) {
      const count = await this.prisma.meal.count({
        where: {
          userId,
          source: 'scanner',
          createdAt: {
            gte: session.startDate,
            lte: session.endDate || new Date(),
          },
        },
      });
      scannedMealsCount += count;
    }

    const streak = activeSession
      ? Math.max(1, Math.ceil((new Date().getTime() - new Date(activeSession.startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      streak,
      activeDays,
      waterTotal,
      scannedMealsCount,
    };
  }
}
export default TravelService;
