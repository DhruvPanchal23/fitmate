import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMemories(userId: string) {
    return this.prisma.userMemory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addMemory(userId: string, category: string, content: string) {
    // Check if fact already exists to prevent duplicate noise
    const existing = await this.prisma.userMemory.findFirst({
      where: {
        userId,
        category,
        content: { contains: content.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userMemory.create({
      data: {
        userId,
        category,
        content: content.trim(),
      },
    });
  }

  async updateMemoryStatus(memoryId: string, status: { isPinned?: boolean; isIgnored?: boolean }) {
    return this.prisma.userMemory.update({
      where: { id: memoryId },
      data: status,
    });
  }

  async deleteMemory(memoryId: string) {
    return this.prisma.userMemory.delete({
      where: { id: memoryId },
    });
  }

  async clearUserMemory(userId: string) {
    return this.prisma.userMemory.deleteMany({
      where: { userId },
    });
  }

  /**
   * Scans text for key declarations and automatically saves new memory elements
   */
  async autoEvolveMemory(userId: string, text: string): Promise<void> {
    const lowercase = text.toLowerCase();
    
    // 1. Allergies
    if (lowercase.includes('allergic to') || lowercase.includes('allergy to')) {
      const match = text.match(/(?:allergic to|allergy to)\s+([a-zA-Z\s]+)/i);
      if (match && match[1]) {
        await this.addMemory(userId, 'allergies', `Allergic to ${match[1].trim()}`);
      }
    }
    
    // 2. Dislikes
    if (lowercase.includes('i dislike') || lowercase.includes('i hate') || lowercase.includes("don't like")) {
      const match = text.match(/(?:i dislike|i hate|don't like)\s+([a-zA-Z\s]+)/i);
      if (match && match[1]) {
        await this.addMemory(userId, 'dislikes', `Dislikes ${match[1].trim()}`);
      }
    }

    // 3. Favorites
    if (lowercase.includes('i love') || lowercase.includes('favorite food') || lowercase.includes('prefer eating')) {
      const match = text.match(/(?:i love|favorite food is|prefer eating)\s+([a-zA-Z\s]+)/i);
      if (match && match[1]) {
        await this.addMemory(userId, 'favorite_foods', `Prefers ${match[1].trim()}`);
      }
    }

    // 4. Workout habits
    if (lowercase.includes('workout') || lowercase.includes('gym routine') || lowercase.includes('exercise')) {
      if (lowercase.includes('morning')) {
        await this.addMemory(userId, 'workout_habits', 'Prefers morning workouts');
      } else if (lowercase.includes('evening')) {
        await this.addMemory(userId, 'workout_habits', 'Prefers evening workouts');
      }
    }

    // 5. Timings
    if (lowercase.includes('dinner at') || lowercase.includes('breakfast at')) {
      const match = text.match(/(dinner|breakfast|lunch)\s+at\s+(\d+:\d+|\d+\s*(?:am|pm))/i);
      if (match) {
        await this.addMemory(userId, 'meal_timings', `Usually has ${match[1]} at ${match[2]}`);
      }
    }
  }
}
export default MemoryService;
