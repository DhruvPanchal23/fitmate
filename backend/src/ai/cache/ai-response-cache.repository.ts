import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AIResponseCacheRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string) {
    return this.prisma.cacheEntry.findFirst({
      where: {
        key,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async set(key: string, value: string, ttlSeconds: number) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    return this.prisma.cacheEntry.upsert({
      where: { key },
      update: {
        value,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        key,
        value,
        expiresAt,
      },
    });
  }

  async clearExpired() {
    return this.prisma.cacheEntry.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getAll() {
    return this.prisma.cacheEntry.findMany();
  }

  async deleteAll() {
    return this.prisma.cacheEntry.deleteMany({});
  }
}
