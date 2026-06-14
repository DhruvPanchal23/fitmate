import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { MealsRepository } from './meals.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService, MealsRepository],
  exports: [MealsService, MealsRepository],
})
export class MealsModule {}
