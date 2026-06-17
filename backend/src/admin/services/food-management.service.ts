import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class FoodManagementService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService
  ) {}

  async searchFoods(query: string, adminUserId: string) {
    return this.adminRepo.searchFoods(query);
  }

  async createFood(data: any, adminUserId: string) {
    const created = await this.adminRepo.createFood({
      ...data,
      source: 'ADMIN_VERIFIED',
    });
    await this.auditService.log({
      adminUserId,
      action: 'food:create',
      target: `Food ID: ${created.id}`,
      afterValue: created,
    });
    return created;
  }

  async updateFood(id: string, data: any, adminUserId: string) {
    const food = await this.adminRepo.findFoodById(id);
    if (!food) throw new NotFoundException('Food item not found');

    const updated = await this.adminRepo.updateFood(id, data);
    await this.auditService.log({
      adminUserId,
      action: 'food:update',
      target: `Food ID: ${id}`,
      beforeValue: food,
      afterValue: updated,
    });
    return updated;
  }

  async deleteFood(id: string, adminUserId: string) {
    const food = await this.adminRepo.findFoodById(id);
    if (!food) throw new NotFoundException('Food item not found');

    await this.adminRepo.deleteFood(id);
    await this.auditService.log({
      adminUserId,
      action: 'food:delete',
      target: `Food ID: ${id}`,
      beforeValue: food,
    });
    return { success: true };
  }

  async approveFood(id: string, adminUserId: string) {
    const food = await this.adminRepo.findFoodById(id);
    if (!food) throw new NotFoundException('Food item not found');

    const updated = await this.adminRepo.updateFood(id, { source: 'ADMIN_VERIFIED' });
    await this.auditService.log({
      adminUserId,
      action: 'food:approve',
      target: `Food ID: ${id}`,
      beforeValue: { source: food.source },
      afterValue: { source: 'ADMIN_VERIFIED' },
    });
    return updated;
  }

  async rejectFood(id: string, adminUserId: string) {
    const food = await this.adminRepo.findFoodById(id);
    if (!food) throw new NotFoundException('Food item not found');

    // Rejecting can just delete or flag it. We'll delete it to keep catalog clean.
    await this.adminRepo.deleteFood(id);
    await this.auditService.log({
      adminUserId,
      action: 'food:reject',
      target: `Food ID: ${id}`,
      beforeValue: food,
    });
    return { success: true };
  }

  async mergeFoods(sourceId: string, targetId: string, adminUserId: string) {
    const sourceFood = await this.adminRepo.findFoodById(sourceId);
    const targetFood = await this.adminRepo.findFoodById(targetId);

    if (!sourceFood || !targetFood) {
      throw new NotFoundException('Source or Target food not found');
    }

    // Merge: Find all MealItems referencing sourceId and update them to targetId
    await this.prisma.mealItem.updateMany({
      where: { foodId: sourceId },
      data: { foodId: targetId },
    });

    // Find all MealPlanMeals referencing sourceId and update them to targetId
    await this.prisma.mealPlanMeal.updateMany({
      where: { foodId: sourceId },
      data: { foodId: targetId },
    });

    // Find all PantryItems referencing sourceId and update them to targetId
    await this.prisma.pantryItem.updateMany({
      where: { foodId: sourceId },
      data: { foodId: targetId },
    });

    // Delete the duplicate sourceFood
    await this.adminRepo.deleteFood(sourceId);

    await this.auditService.log({
      adminUserId,
      action: 'food:merge',
      target: `Merged Source: ${sourceId} into Target: ${targetId}`,
      beforeValue: { sourceFood, targetFood },
    });

    return { success: true };
  }

  async bulkImport(foods: any[], adminUserId: string) {
    const imported: any[] = [];
    for (const foodData of foods) {
      const created = await this.adminRepo.createFood({
        name: foodData.name,
        calories: Number(foodData.calories),
        protein: Number(foodData.protein),
        carbohydrates: Number(foodData.carbohydrates),
        fats: Number(foodData.fats),
        fiber: Number(foodData.fiber || 0),
        sugar: Number(foodData.sugar || 0),
        defaultUnit: foodData.defaultUnit || 'g',
        servingSize: Number(foodData.servingSize || 100),
        source: 'ADMIN_VERIFIED',
      });
      imported.push(created);
    }

    await this.auditService.log({
      adminUserId,
      action: 'food:bulk_import',
      target: `Imported count: ${imported.length}`,
    });

    return imported;
  }

  async bulkExport(adminUserId: string) {
    await this.auditService.log({
      adminUserId,
      action: 'food:bulk_export',
      target: 'Exported all foods',
    });
    return this.prisma.food.findMany();
  }
}
export default FoodManagementService;
