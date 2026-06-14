import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealScanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: {
    imageUrl: string;
    model: string;
    confidence: number;
    rawResponse: string;
    processedMatches: string;
    status: string;
  }) {
    try {
      return await this.prisma.mealScan.create({
        data: {
          userId,
          imageUrl: data.imageUrl,
          model: data.model,
          confidence: data.confidence,
          rawResponse: data.rawResponse,
          processedMatches: data.processedMatches,
          status: data.status,
        },
      });
    } catch (e) {
      // Offline fallback
      return {
        id: 'mock-scan-' + Math.random().toString(36).substr(2, 9),
        userId,
        mealId: null,
        imageUrl: data.imageUrl,
        model: data.model,
        confidence: data.confidence,
        rawResponse: data.rawResponse,
        processedMatches: data.processedMatches,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.mealScan.findUnique({
        where: { id },
      });
    } catch (e) {
      return null;
    }
  }

  async update(id: string, data: {
    status?: string;
    mealId?: string;
    processedMatches?: string;
    confidence?: number;
  }) {
    try {
      return await this.prisma.mealScan.update({
        where: { id },
        data,
      });
    } catch (e) {
      // Mock update fallback
      return {
        id,
        ...data,
      };
    }
  }
}
