import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService,
    private readonly jwtService: JwtService
  ) {}

  async searchUsers(query: string, adminUserId: string) {
    const users = await this.adminRepo.searchUsers(query);
    await this.auditService.log({
      adminUserId,
      action: 'user:search',
      target: `Query: ${query}`,
    });
    return users;
  }

  async suspendUser(userId: string, adminUserId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.adminRepo.updateUserStatus(userId, { isSuspended: true });
    await this.auditService.log({
      adminUserId,
      action: 'user:suspend',
      target: `User ID: ${userId}`,
      beforeValue: { isSuspended: user.isSuspended },
      afterValue: { isSuspended: true },
    });
    return updated;
  }

  async banUser(userId: string, adminUserId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.adminRepo.updateUserStatus(userId, { isBanned: true });
    await this.auditService.log({
      adminUserId,
      action: 'user:ban',
      target: `User ID: ${userId}`,
      beforeValue: { isBanned: user.isBanned },
      afterValue: { isBanned: true },
    });
    return updated;
  }

  async restoreUser(userId: string, adminUserId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.adminRepo.updateUserStatus(userId, { isSuspended: false, isBanned: false });
    await this.auditService.log({
      adminUserId,
      action: 'user:restore',
      target: `User ID: ${userId}`,
      beforeValue: { isSuspended: user.isSuspended, isBanned: user.isBanned },
      afterValue: { isSuspended: false, isBanned: false },
    });
    return updated;
  }

  async resetUserProfile(userId: string, adminUserId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.adminRepo.resetUserProfile(userId);
    await this.auditService.log({
      adminUserId,
      action: 'user:reset_profile',
      target: `User ID: ${userId}`,
      beforeValue: user.profile,
      afterValue: updated,
    });
    return updated;
  }

  async impersonateUser(userId: string, adminUserId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Sign a token impersonating the user (development only)
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    await this.auditService.log({
      adminUserId,
      action: 'user:impersonate',
      target: `User ID: ${userId}`,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName || 'User',
      },
    };
  }
}
export default UserManagementService;
