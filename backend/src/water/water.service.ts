import { Injectable } from '@nestjs/common';
import { WaterRepository } from './water.repository';
import { LogWaterRequest } from '../../../shared/contracts';

@Injectable()
export class WaterService {
  constructor(private readonly repository: WaterRepository) {}

  async logWater(userId: string, dto: LogWaterRequest) {
    return this.repository.create(userId, dto);
  }

  async getWaterLogs(userId: string, dateStr?: string) {
    const filterDate = dateStr || new Date().toISOString().split('T')[0];
    return this.repository.findMany(userId, filterDate);
  }
}
