import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class RemoteConfigService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService
  ) {}

  async getRemoteConfigs(adminUserId: string) {
    return this.adminRepo.getRemoteConfigs();
  }

  async createRemoteConfig(data: { key: string; value: string; description?: string }, adminUserId: string) {
    const existing = await this.adminRepo.findRemoteConfigByKey(data.key);
    if (existing) {
      return this.updateRemoteConfig(data.key, data, adminUserId);
    }

    const created = await this.adminRepo.createRemoteConfig(data);
    await this.auditService.log({
      adminUserId,
      action: 'config:create',
      target: `Config key: ${data.key}`,
      afterValue: created,
    });
    return created;
  }

  async updateRemoteConfig(key: string, data: { value?: string; description?: string }, adminUserId: string) {
    const config = await this.adminRepo.findRemoteConfigByKey(key);
    if (!config) throw new NotFoundException('Remote configuration key not found');

    const updated = await this.adminRepo.updateRemoteConfig(key, data);
    await this.auditService.log({
      adminUserId,
      action: 'config:update',
      target: `Config key: ${key}`,
      beforeValue: config,
      afterValue: updated,
    });
    return updated;
  }

  async getConfigValue(key: string, defaultValue: string): Promise<string> {
    const config = await this.adminRepo.findRemoteConfigByKey(key);
    return config ? config.value : defaultValue;
  }
}
export default RemoteConfigService;
