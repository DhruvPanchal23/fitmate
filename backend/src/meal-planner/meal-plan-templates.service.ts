import { Injectable, NotFoundException } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';
import { SaveTemplateRequest } from '../../../shared/contracts';

@Injectable()
export class MealPlanTemplatesService {
  constructor(private readonly repository: MealPlanRepository) {}

  async savePlanAsTemplate(userId: string, dto: SaveTemplateRequest) {
    const plan = await this.repository.findPlan(dto.planId);
    if (!plan) throw new NotFoundException('Meal plan not found');

    const planData = JSON.stringify(plan);
    return this.repository.saveTemplate(userId, dto.title, dto.description, planData);
  }

  async getTemplates(userId: string) {
    return this.repository.findTemplates(userId);
  }

  async deleteTemplate(id: string) {
    await this.repository.deleteTemplate(id);
    return { success: true };
  }
}
export default MealPlanTemplatesService;
