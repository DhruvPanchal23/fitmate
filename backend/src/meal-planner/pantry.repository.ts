import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PantryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserPantry(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      include: {
        food: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async upsertItem(userId: string, data: { foodId: string; quantity: number; unit: string; expiryDate?: Date }) {
    const existing = await this.prisma.pantryItem.findFirst({
      where: {
        userId,
        foodId: data.foodId,
      },
    });

    if (existing) {
      return this.prisma.pantryItem.update({
        where: { id: existing.id },
        data: {
          quantity: data.quantity,
          unit: data.unit,
          expiryDate: data.expiryDate || existing.expiryDate,
        },
      });
    }

    return this.prisma.pantryItem.create({
      data: {
        userId,
        foodId: data.foodId,
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiryDate,
      },
    });
  }

  async deleteItem(id: string) {
    return this.prisma.pantryItem.delete({
      where: { id },
    });
  }

  async updateQuantity(id: string, qty: number) {
    if (qty <= 0) {
      return this.prisma.pantryItem.delete({
        where: { id },
      });
    }
    return this.prisma.pantryItem.update({
      where: { id },
      data: { quantity: qty },
    });
  }
}
export default PantryRepository;
