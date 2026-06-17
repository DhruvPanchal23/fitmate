import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class FeatureFlagService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService
  ) {}

  async getFeatureFlags(adminUserId: string) {
    return this.adminRepo.getFeatureFlags();
  }

  async createFeatureFlag(data: { key: string; enabled: boolean; description?: string; rules?: string }, adminUserId: string) {
    const existing = await this.adminRepo.findFeatureFlagByKey(data.key);
    if (existing) {
      return this.updateFeatureFlag(data.key, data, adminUserId);
    }

    const created = await this.adminRepo.createFeatureFlag(data);
    await this.auditService.log({
      adminUserId,
      action: 'flag:create',
      target: `Flag key: ${data.key}`,
      afterValue: created,
    });
    return created;
  }

  async updateFeatureFlag(key: string, data: { enabled?: boolean; description?: string; rules?: string }, adminUserId: string) {
    const flag = await this.adminRepo.findFeatureFlagByKey(key);
    if (!flag) throw new NotFoundException('Feature flag not found');

    const updated = await this.adminRepo.updateFeatureFlag(key, data);
    await this.auditService.log({
      adminUserId,
      action: 'flag:update',
      target: `Flag key: ${key}`,
      beforeValue: flag,
      afterValue: updated,
    });
    return updated;
  }

  async isFeatureEnabled(key: string, userId: string): Promise<boolean> {
    const flag = await this.adminRepo.findFeatureFlagByKey(key);
    if (!flag) return false;
    if (!flag.enabled) return false;

    if (flag.rules) {
      try {
        const parsedRules = JSON.parse(flag.rules);
        // Simple targeting rules rule checking: e.g. target specific userIds
        if (parsedRules.userIds && Array.isArray(parsedRules.userIds)) {
          return parsedRules.userIds.includes(userId);
        }
      } catch {
        return flag.enabled;
      }
    }

    return flag.enabled;
  }
}
export default FeatureFlagService;
