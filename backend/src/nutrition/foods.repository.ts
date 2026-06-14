import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    try {
      return await this.prisma.food.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 20,
      });
    } catch (e) {
      return [];
    }
  }

  async create(data: any) {
    try {
      return await this.prisma.food.create({
        data,
      });
    } catch (e) {
      return null;
    }
  }

  async findByName(name: string) {
    try {
      return await this.prisma.food.findUnique({
        where: { name },
      });
    } catch (e) {
      return null;
    }
  }
}
