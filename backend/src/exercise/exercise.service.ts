import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from './exercise.repository';
import { LogExerciseRequest } from '../../../shared/contracts';

@Injectable()
export class ExerciseService {
  constructor(private readonly repository: ExerciseRepository) {}

  async logExercise(userId: string, dto: LogExerciseRequest) {
    return this.repository.create(userId, dto);
  }

  async getExerciseLogs(userId: string, dateStr?: string) {
    const filterDate = dateStr || new Date().toISOString().split('T')[0];
    return this.repository.findMany(userId, filterDate);
  }
}
