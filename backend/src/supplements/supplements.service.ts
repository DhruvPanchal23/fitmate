import { Injectable } from '@nestjs/common';
import { SupplementsRepository } from './supplements.repository';
import { LogSupplementRequest } from '../../../shared/contracts';

@Injectable()
export class SupplementsService {
  constructor(private readonly repository: SupplementsRepository) {}

  async logSupplement(userId: string, dto: LogSupplementRequest) {
    return this.repository.create(userId, dto);
  }

  async getSupplementLogs(userId: string, dateStr?: string) {
    const filterDate = dateStr || new Date().toISOString().split('T')[0];
    return this.repository.findMany(userId, filterDate);
  }
}
