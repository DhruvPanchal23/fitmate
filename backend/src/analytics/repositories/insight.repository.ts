import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InsightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInsights(userId: string) {
    return this.prisma.insight.findMany({
      where: {
        userId,
        dismissed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async dismissInsight(insightId: string) {
    return this.prisma.insight.update({
      where: { id: insightId },
      data: { dismissed: true },
    });
  }

  async saveInsight(data: {
    userId: string;
    title: string;
    description: string;
    category: string;
    value?: number | null;
  }) {
    // Check if duplicate active insight exists
    const existing = await this.prisma.insight.findFirst({
      where: {
        userId: data.userId,
        category: data.category,
        dismissed: false,
      },
    });

    if (existing) {
      return this.prisma.insight.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.insight.create({
      data,
    });
  }
}
export default InsightRepository;
