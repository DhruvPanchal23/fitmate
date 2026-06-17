import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class NotificationManagementService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService
  ) {}

  async getAnnouncements(adminUserId: string) {
    return this.adminRepo.getAnnouncements();
  }

  async createAnnouncement(
    data: {
      title: string;
      body: string;
      targetGroup: string;
      scheduledFor?: Date;
      expiresAt?: Date;
    },
    adminUserId: string
  ) {
    const created = await this.adminRepo.createAnnouncement(data);
    await this.auditService.log({
      adminUserId,
      action: 'announcement:create',
      target: `Announcement ID: ${created.id}`,
      afterValue: created,
    });

    // If it's scheduled for immediate dispatch (no schedule date or date is past), dispatch it
    if (!data.scheduledFor || new Date(data.scheduledFor).getTime() <= Date.now()) {
      await this.dispatchAnnouncement(created.id, adminUserId);
    }

    return created;
  }

  async dispatchAnnouncement(announcementId: string, adminUserId: string) {
    const announcement = await this.prisma.systemAnnouncement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement || announcement.sent) return;

    // Find target users
    let targetUsers: any[] = [];
    if (announcement.targetGroup === 'all') {
      targetUsers = await this.prisma.user.findMany({ select: { id: true } });
    } else if (announcement.targetGroup === 'beta') {
      // Find beta users (e.g. users with specific email domain or registered recently)
      targetUsers = await this.prisma.user.findMany({
        where: { email: { contains: 'test' } },
        select: { id: true },
      });
      if (targetUsers.length === 0) {
        targetUsers = await this.prisma.user.findMany({ take: 5, select: { id: true } }); // fallback
      }
    } else {
      // Fallback
      targetUsers = await this.prisma.user.findMany({ select: { id: true } });
    }

    // Create a notification for each target user
    const notificationsData = targetUsers.map(user => ({
      userId: user.id,
      title: announcement.title,
      body: announcement.body,
      type: 'system',
      read: false,
    }));

    if (notificationsData.length > 0) {
      await this.prisma.notification.createMany({
        data: notificationsData,
      });
    }

    // Mark announcement as sent
    const updated = await this.prisma.systemAnnouncement.update({
      where: { id: announcementId },
      data: { sent: true },
    });

    await this.auditService.log({
      adminUserId,
      action: 'announcement:dispatch',
      target: `Announcement ID: ${announcementId}, Dispatched count: ${targetUsers.length}`,
      afterValue: updated,
    });
  }
}
export default NotificationManagementService;
