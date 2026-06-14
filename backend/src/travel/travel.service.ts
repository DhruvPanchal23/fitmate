import { Injectable } from '@nestjs/common';
import { TravelRepository } from './travel.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TravelService {
  constructor(
    private readonly repository: TravelRepository,
    private readonly prisma: PrismaService,
  ) {}

  async toggleTravelMode(userId: string, active: boolean) {
    if (active) {
      await this.repository.deactivateSessions(userId);
      const session = await this.repository.createSession(userId);
      return { success: true, active: true, session };
    } else {
      await this.repository.deactivateSessions(userId);
      return { success: true, active: false };
    }
  }

  async isTravelModeActive(userId: string): Promise<boolean> {
    const activeSession = await this.repository.findActiveSession(userId);
    return !!activeSession;
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
