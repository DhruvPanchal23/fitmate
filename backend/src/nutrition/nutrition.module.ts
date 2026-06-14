import { Module } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { FoodsService } from './foods.service';
import { FoodsRepository } from './foods.repository';
import { UsersModule } from '../users/users.module';
import { MealsModule } from '../meals/meals.module';
import { WaterModule } from '../water/water.module';
import { SupplementsModule } from '../supplements/supplements.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    MealsModule,
    WaterModule,
    SupplementsModule,
    ExerciseModule,
  ],
  controllers: [NutritionController],
  providers: [
    NutritionService,
    NutritionCalculatorService,
    FoodsService,
    FoodsRepository,
  ],
  exports: [
    NutritionService,
    NutritionCalculatorService,
    FoodsService,
    FoodsRepository,
  ],
})
export class NutritionModule {}
