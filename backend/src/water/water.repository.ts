import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogWaterRequest } from '../../../shared/contracts';

@Injectable()
export class WaterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: LogWaterRequest) {
    try {
      return await this.prisma.waterLog.create({
        data: {
          userId,
          amount: dto.amount,
          unit: dto.unit,
        },
      });
    } catch (e) {
      // Offline fallback
      return {
        id: 'mock-water-' + Math.random().toString(36).substr(2, 9),
        userId,
        amount: dto.amount,
        unit: dto.unit,
        createdAt: new Date(),
      };
    }
  }

  async findMany(userId: string, dateStr?: string) {
    try {
      const whereClause: any = { userId };

      if (dateStr) {
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);

        whereClause.createdAt = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      return await this.prisma.waterLog.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (e) {
      // Offline fallback
      return [];
    }
  }
}
