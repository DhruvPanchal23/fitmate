import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[Prisma] Database connected successfully.');
    } catch (e) {
      console.warn('[Prisma] WARNING: Could not connect to PostgreSQL database. Running with local mock fallbacks.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
