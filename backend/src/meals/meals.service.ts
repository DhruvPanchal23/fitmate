import { Injectable, NotFoundException } from '@nestjs/common';
import { MealsRepository } from './meals.repository';
import { CreateMealRequest } from '../../../shared/contracts';

@Injectable()
export class MealsService {
  constructor(private readonly repository: MealsRepository) {}

  async createMeal(userId: string, dto: CreateMealRequest) {
    return this.repository.create(userId, dto);
  }

  async getMeals(userId: string, dateStr?: string) {
    const filterDate = dateStr || new Date().toISOString().split('T')[0];
    return this.repository.findMany(userId, filterDate);
  }

  async deleteMeal(id: string) {
    const meal = await this.repository.findOne(id);
    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    return this.repository.delete(id);
  }
}
