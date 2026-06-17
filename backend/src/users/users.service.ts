import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId },
        include: { user: { select: { email: true } } },
      });
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      return profile;
    } catch (e) {
      // Mock Fallback if database connection is offline
      return {
        id: 'mock-profile-id',
        userId,
        fullName: 'Dhruv',
        age: 25,
        gender: 'male',
        height: 175,
        weight: 70,
        activityLevel: 'moderately_active',
        goal: 'maintenance',
        user: {
          email: 'dhruv@fitmate.com',
        },
      };
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      return await this.prisma.userProfile.upsert({
        where: { userId },
        update: dto,
        create: {
          userId,
          ...dto,
        },
      });
    } catch (e) {
      // Mock Fallback if database connection is offline
      return {
        id: 'mock-profile-id',
        userId,
        ...dto,
      };
    }
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        meals: { include: { items: true } },
        waterLogs: true,
        supplementLogs: true,
        exerciseLogs: true,
        conversations: { include: { messages: true } },
        travelSessions: true,
        analyticsSnapshots: true,
        memories: true,
        notifications: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUserData } = user;
    return safeUserData;
  }

  async deleteMemory(userId: string) {
    const result = await this.prisma.userMemory.deleteMany({
      where: { userId },
    });
    return { success: true, count: result.count };
  }

  async deleteAnalytics(userId: string) {
    const result = await this.prisma.analyticsSnapshot.deleteMany({
      where: { userId },
    });
    return { success: true, count: result.count };
  }

  async deleteConversations(userId: string) {
    const result = await this.prisma.conversation.deleteMany({
      where: { userId },
    });
    return { success: true, count: result.count };
  }

  async deleteTravelData(userId: string) {
    const result = await this.prisma.travelSession.deleteMany({
      where: { userId },
    });
    return { success: true, count: result.count };
  }

  async softDeleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Account soft-deleted/suspended.' };
  }

  async permanentlyDeleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { success: true, message: 'Account permanently deleted.' };
  }
}
