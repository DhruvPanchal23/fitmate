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
    });
  }

  async createSession(userId: string) {
    return this.prisma.travelSession.create({
      data: {
        userId,
        active: true,
        startDate: new Date(),
      },
    });
  }

  async deactivateSessions(userId: string) {
    return this.prisma.travelSession.updateMany({
      where: {
        userId,
        active: true,
      },
      data: {
        active: false,
        endDate: new Date(),
      },
    });
  }

  async findMany(userId: string) {
    return this.prisma.travelSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}
