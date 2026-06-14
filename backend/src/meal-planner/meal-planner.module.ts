import { Module } from '@nestjs/common';
import { MealPlannerController } from './meal-planner.controller';
import { MealPlannerService } from './meal-planner.service';
import { MealPlanRepository } from './meal-plan.repository';
import { PantryRepository } from './pantry.repository';
import { MealPlanPlanGenerator } from './meal-plan.generator';
import { FoodSelectionEngine } from './food-selection.engine';
import { MacroValidationEngine } from './macro-validation.engine';
import { MealDiversityScoreService } from './meal-diversity-score.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { MealsModule } from '../meals/meals.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, UsersModule, MealsModule, AiModule],
  controllers: [MealPlannerController],
  providers: [
    MealPlannerService,
    MealPlanRepository,
    PantryRepository,
    MealPlanPlanGenerator,
    FoodSelectionEngine,
    MacroValidationEngine,
    MealDiversityScoreService,
  ],
  exports: [MealPlannerService, MealPlanRepository, PantryRepository],
})
export class MealPlannerModule {}
export default MealPlannerModule;
