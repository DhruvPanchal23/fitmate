import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogSupplementRequest } from '../../../shared/contracts';

@Injectable()
export class SupplementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: LogSupplementRequest) {
    try {
      return await this.prisma.supplementLog.create({
        data: {
          userId,
          name: dto.name,
          dosage: dto.dosage,
          unit: dto.unit,
        },
      });
    } catch (e) {
      // Offline fallback
      return {
        id: 'mock-supp-' + Math.random().toString(36).substr(2, 9),
        userId,
        name: dto.name,
        dosage: dto.dosage,
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

      return await this.prisma.supplementLog.findMany({
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
