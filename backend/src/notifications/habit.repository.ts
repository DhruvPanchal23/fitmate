import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findHabits(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findHabitByName(userId: string, name: string) {
    return this.prisma.habit.findFirst({
      where: { userId, name },
    });
  }

  async upsertHabit(
    userId: string,
    name: string,
    data: { streak?: number; completionRate?: number; targetFrequency?: number }
  ) {
    const existing = await this.prisma.habit.findFirst({
      where: { userId, name },
    });

    if (existing) {
      return this.prisma.habit.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.habit.create({
      data: {
        userId,
        name,
        streak: data.streak || 0,
        completionRate: data.completionRate || 0.0,
        targetFrequency: data.targetFrequency || 7, // default to daily target
      },
    });
  }

  async updateCompletionRate(id: string, completionRate: number) {
    return this.prisma.habit.update({
      where: { id },
      data: { completionRate },
    });
  }
}
export default HabitRepository;
