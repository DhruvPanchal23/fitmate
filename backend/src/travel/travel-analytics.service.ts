import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TravelAnalyticsResponse } from '../../../shared/contracts/travel-compensation';

@Injectable()
export class TravelAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionAnalytics(userId: string, travelSessionId: string): Promise<TravelAnalyticsResponse> {
    const summaries = await this.prisma.travelDailySummary.findMany({
      where: { travelSessionId },
      orderBy: { date: 'asc' },
    });

    // Fetch user's latest goals to compute deviation
    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const targetProtein = latestGoal?.protein || 130; // fallback target

    if (summaries.length === 0) {
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

    const totalDays = summaries.length;
    const totalSurplus = summaries.reduce((sum, s) => sum + s.surplus, 0);
    const averageCalorieSurplus = Math.round(totalSurplus / totalDays);
    
    // Deviation is consumed - target
    const totalProteinDeviation = summaries.reduce((sum, s) => sum + (s.protein - targetProtein), 0);
    const averageProteinDeviation = Math.round(totalProteinDeviation / totalDays);
    
    const averageSteps = Math.round(summaries.reduce((sum, s) => sum + s.steps, 0) / totalDays);
    const averageWater = Math.round(summaries.reduce((sum, s) => sum + s.water, 0) / totalDays);

    const dailySurpluses = summaries.map(s => ({
      date: s.date.toISOString().split('T')[0],
      surplus: s.surplus,
      caloriesConsumed: s.caloriesConsumed,
      caloriesTarget: s.caloriesTarget,
    }));

    return {
      totalDays,
      totalSurplus,
      averageCalorieSurplus,
      averageProteinDeviation,
      averageSteps,
      averageWater,
      dailySurpluses,
    };
  }

  async getHistoryAnalytics(userId: string) {
    const sessions = await this.prisma.travelSession.findMany({
      where: { userId },
      include: {
        dailySummaries: true,
        compensationPlan: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return sessions.map(session => {
      const summaries = session.dailySummaries;
      const totalSurplus = summaries.reduce((sum, s) => sum + s.surplus, 0);
      return {
        id: session.id,
        destination: session.destination,
        startDate: session.startDate,
        endDate: session.endDate,
        active: session.active,
        purpose: session.purpose,
        totalSurplus,
        days: summaries.length,
        compensationStatus: session.compensationPlan?.status || null,
      };
    });
  }
}
export default TravelAnalyticsService;
