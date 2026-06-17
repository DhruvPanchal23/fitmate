import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AuditService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async log(params: {
    adminUserId: string;
    action: string;
    target: string;
    beforeValue?: any;
    afterValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.adminRepo.createAuditLog({
      adminUserId: params.adminUserId,
      action: params.action,
      target: params.target,
      beforeValue: params.beforeValue ? JSON.stringify(params.beforeValue) : undefined,
      afterValue: params.afterValue ? JSON.stringify(params.afterValue) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  async logUserAction(params: {
    userId: string;
    action: string;
    target: string;
    beforeValue?: any;
    afterValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Computes difference payload diff if before/after values are objects
    const beforeObj = params.beforeValue || {};
    const afterObj = params.afterValue || {};
    const diff: Record<string, { before: any; after: any }> = {};

    if (typeof beforeObj === 'object' && typeof afterObj === 'object') {
      const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
      for (const key of keys) {
        if (JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])) {
          diff[key] = {
            before: beforeObj[key],
            after: afterObj[key],
          };
        }
      }
    }

    return this.adminRepo.createAuditLog({
      action: params.action,
      target: `User:${params.userId} -> ${params.target}`,
      beforeValue: params.beforeValue ? JSON.stringify(params.beforeValue) : undefined,
      afterValue: params.afterValue ? (Object.keys(diff).length > 0 ? JSON.stringify({ diff, full: params.afterValue }) : JSON.stringify(params.afterValue)) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  async getLogs() {
    return this.adminRepo.getAuditLogs();
  }
}
export default AuditService;
