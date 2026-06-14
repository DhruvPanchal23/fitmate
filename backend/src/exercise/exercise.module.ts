import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseRepository } from './exercise.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExerciseService, ExerciseRepository],
  exports: [ExerciseService, ExerciseRepository],
})
export class ExerciseModule {}
