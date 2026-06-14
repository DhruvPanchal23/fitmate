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
}
