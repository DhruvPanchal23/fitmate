import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    scheduledFor?: Date | null;
    deliveredAt?: Date | null;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        scheduledFor: data.scheduledFor,
        deliveredAt: data.deliveredAt,
      },
    });
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      return this.prisma.notification.updateMany({
        where: {
          userId,
          id: { in: notificationIds },
        },
        data: { read: true },
      });
    }
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async deleteNotification(userId: string, id: string) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  async findReminders(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
    });
  }

  async findReminderByType(userId: string, type: string) {
    return this.prisma.reminder.findFirst({
      where: { userId, type },
    });
  }

  async upsertReminder(
    userId: string,
    type: string,
    data: { enabled?: boolean; time?: string; days?: number[]; smart?: boolean }
  ) {
    const existing = await this.prisma.reminder.findFirst({
      where: { userId, type },
    });

    if (existing) {
      return this.prisma.reminder.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.reminder.create({
      data: {
        userId,
        type,
        enabled: data.enabled !== undefined ? data.enabled : true,
        time: data.time || '08:00',
        days: data.days || [0, 1, 2, 3, 4, 5, 6],
        smart: data.smart !== undefined ? data.smart : false,
      },
    });
  }

  async logNotificationDelivery(notificationId: string, delivered: boolean) {
    return this.prisma.notificationHistory.create({
      data: {
        notificationId,
        delivered,
        opened: false,
      },
    });
  }

  async logNotificationOpen(notificationId: string, actionTaken?: string) {
    const history = await this.prisma.notificationHistory.findFirst({
      where: { notificationId },
      orderBy: { createdAt: 'desc' },
    });

    if (history) {
      return this.prisma.notificationHistory.update({
        where: { id: history.id },
        data: { opened: true, actionTaken },
      });
    }

    return this.prisma.notificationHistory.create({
      data: {
        notificationId,
        delivered: true,
        opened: true,
        actionTaken,
      },
    });
  }
}
export default NotificationRepository;
