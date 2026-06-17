import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AnalyticsManagementService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async getMetrics(adminUserId: string) {
    return this.adminRepo.getMetrics();
  }
}
export default AnalyticsManagementService;
