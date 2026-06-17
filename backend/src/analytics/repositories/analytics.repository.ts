import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveSnapshot(data: {
    userId: string;
    date: Date;
    healthScore: number;
    consistencyScore: number;
    adherenceScore: number;
    weight?: number | null;
    bodyFat?: number | null;
    caloriesConsumed: number;
    caloriesTarget: number;
    proteinConsumed: number;
    proteinTarget: number;
    carbsConsumed: number;
    carbsTarget: number;
    fatsConsumed: number;
    fatsTarget: number;
    waterConsumed: number;
    waterTarget: number;
    steps: number;
    workoutCalories: number;
  }) {
    // Find if a snapshot for the same date exists
    const startOfDay = new Date(data.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(data.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await this.prisma.analyticsSnapshot.findFirst({
      where: {
        userId: data.userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      return this.prisma.analyticsSnapshot.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.analyticsSnapshot.create({
      data,
    });
  }

  async findSnapshots(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.analyticsSnapshot.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async saveHealthScoreHistory(userId: string, score: number, breakdown: any, date: Date) {
    return this.prisma.healthScoreHistory.create({
      data: {
        userId,
        score,
        date,
        breakdown: JSON.stringify(breakdown),
      },
    });
  }

  async findHealthScoreHistory(userId: string) {
    return this.prisma.healthScoreHistory.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }
}
export default AnalyticsRepository;
