import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TravelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveSession(userId: string) {
    return this.prisma.travelSession.findFirst({
      where: {
        userId,
        active: true,
      },
      include: {
        dailySummaries: true,
        compensationPlan: true,
      },
    });
  }

  async findSessionById(sessionId: string) {
    return this.prisma.travelSession.findUnique({
      where: { id: sessionId },
      include: {
        dailySummaries: true,
        compensationPlan: true,
      },
    });
  }

  async createSession(userId: string, destination?: string, timezone?: string, purpose?: string) {
    return this.prisma.travelSession.create({
      data: {
        userId,
        active: true,
        startDate: new Date(),
        destination,
        timezone,
        purpose,
      },
    });
  }

  async deactivateSessions(userId: string) {
    // Find active session first to return it
    const active = await this.findActiveSession(userId);
    if (!active) return null;

    await this.prisma.travelSession.updateMany({
      where: {
        userId,
        active: true,
      },
      data: {
        active: false,
        endDate: new Date(),
      },
    });

    return this.findSessionById(active.id);
  }

  async findMany(userId: string) {
    return this.prisma.travelSession.findMany({
      where: {
        userId,
      },
      include: {
        dailySummaries: true,
        compensationPlan: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async saveDailySummary(data: {
    travelSessionId: string;
    date: Date;
    caloriesConsumed: number;
    caloriesTarget: number;
    surplus: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
    exerciseCalories: number;
    steps: number;
  }) {
    // Upsert to handle multiple summary logs for the same day
    const existing = await this.prisma.travelDailySummary.findFirst({
      where: {
        travelSessionId: data.travelSessionId,
        date: {
          equals: data.date,
        },
      },
    });

    if (existing) {
      return this.prisma.travelDailySummary.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.travelDailySummary.create({
      data,
    });
  }

  async saveCompensationPlan(data: {
    userId: string;
    travelSessionId: string;
    totalSurplusCalories: number;
    dailyReductionCalories: number;
    recoveryDays: number;
    recommendedWalkingMinutes: number;
    recommendedCardioMinutes: number;
    recommendedStrengthSessions: number;
    status: string;
  }) {
    return this.prisma.compensationPlan.upsert({
      where: { travelSessionId: data.travelSessionId },
      update: data,
      create: data,
    });
  }

  async findActiveCompensationPlan(userId: string) {
    return this.prisma.compensationPlan.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        travelSession: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateCompensationPlanStatus(planId: string, status: string) {
    return this.prisma.compensationPlan.update({
      where: { id: planId },
      data: { status },
    });
  }
}
export default TravelRepository;

