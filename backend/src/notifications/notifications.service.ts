import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { HabitRepository } from './habit.repository';
import { ReminderEngine } from './reminder.engine';
import { HabitEngine } from './habit.engine';
import { ScheduleEngine } from './schedule.engine';
import {
  NotificationResponse,
  ReminderResponse,
  HabitResponse,
  HabitStreakResponse,
  HabitAnalyticsResponse,
  UpdateReminderRequest,
} from '../../../shared/contracts/notifications';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly habitRepository: HabitRepository,
    private readonly reminderEngine: ReminderEngine,
    private readonly habitEngine: HabitEngine,
    private readonly scheduleEngine: ScheduleEngine
  ) {}

  async getNotifications(userId: string): Promise<NotificationResponse[]> {
    const list = await this.notificationRepository.findNotifications(userId);
    return list.map(item => this.mapNotification(item));
  }

  async markAsRead(userId: string, notificationIds?: string[]): Promise<any> {
    await this.notificationRepository.markAsRead(userId, notificationIds);
    return { success: true };
  }

  async deleteNotification(userId: string, id: string): Promise<any> {
    await this.notificationRepository.deleteNotification(userId, id);
    return { success: true };
  }

  async getReminders(userId: string): Promise<ReminderResponse[]> {
    const list = await this.notificationRepository.findReminders(userId);
    // If no reminders are configured, initialize default reminders
    if (list.length === 0) {
      const defaults = [
        { type: 'meal_breakfast', enabled: true, time: '08:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'meal_lunch', enabled: true, time: '13:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'meal_dinner', enabled: true, time: '20:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'water', enabled: true, time: '14:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'exercise', enabled: true, time: '18:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'sleep', enabled: true, time: '22:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'measurement', enabled: true, time: '07:30', days: [0], smart: true }, // Weekly on Sunday
        { type: 'planner', enabled: true, time: '09:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'travel', enabled: true, time: '12:00', days: [0,1,2,3,4,5,6], smart: true },
        { type: 'coach', enabled: true, time: '16:00', days: [0,1,2,3,4,5,6], smart: true },
      ];
      const created = await Promise.all(
        defaults.map(d => this.notificationRepository.upsertReminder(userId, d.type, d))
      );
      return created.map(item => this.mapReminder(item));
    }
    return list.map(item => this.mapReminder(item));
  }

  async updateReminder(userId: string, update: UpdateReminderRequest): Promise<ReminderResponse> {
    const reminder = await this.notificationRepository.upsertReminder(userId, update.id, {
      enabled: update.enabled,
      time: update.time,
      days: update.days,
      smart: update.smart,
    });
    return this.mapReminder(reminder);
  }

  async getHabits(userId: string): Promise<HabitResponse[]> {
    const list = await this.habitRepository.findHabits(userId);
    if (list.length === 0) {
      // Initialize habits
      const habitNames = [
        { name: 'water', targetFreq: 7 },
        { name: 'meal_logging', targetFreq: 7 },
        { name: 'workout', targetFreq: 4 },
        { name: 'planner', targetFreq: 5 },
        { name: 'sleep', targetFreq: 7 },
        { name: 'ai_coach', targetFreq: 3 },
      ];
      const created = await Promise.all(
        habitNames.map(h => this.habitRepository.upsertHabit(userId, h.name, { targetFrequency: h.targetFreq }))
      );
      return created.map(item => this.mapHabit(item));
    }
    return list.map(item => this.mapHabit(item));
  }

  async getHabitStreaks(userId: string): Promise<HabitStreakResponse[]> {
    const habits = await this.getHabits(userId);
    return habits.map(h => ({
      habitId: h.id,
      name: h.name,
      streak: h.streak,
    }));
  }

  async getHabitAnalytics(userId: string): Promise<HabitAnalyticsResponse> {
    const stats = await this.habitEngine.calculateHabitAnalytics(userId);
    // Proactively sync scores back to DB habit models
    await Promise.all(
      stats.habits.map(h =>
        this.habitRepository.upsertHabit(userId, h.name, {
          streak: h.streak,
          completionRate: h.completionRate,
        })
      )
    );
    return {
      weeklyScore: stats.weeklyScore,
      monthlyScore: stats.monthlyScore,
      completionPercentage: stats.completionPercentage,
      insights: stats.insights,
    };
  }

  async triggerSmartRemindersCheck(userId: string): Promise<NotificationResponse[]> {
    const pendingReminders = await this.reminderEngine.checkAndGenerateReminders(userId);
    const generated: any[] = [];

    // Avoid duplicate reminders triggered recently (e.g. today)
    const existingNotifications = await this.notificationRepository.findNotifications(userId);
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    for (const reminder of pendingReminders) {
      // Find if we already sent this specific reminder type today
      const alreadySent = existingNotifications.some(
        n => n.type === reminder.type && new Date(n.createdAt).getTime() >= startOfDay.getTime()
      );

      if (!alreadySent) {
        // Calculate dynamic schedule
        const scheduledTime = await this.scheduleEngine.calculateScheduledTime(userId, reminder.type);

        const notification = await this.notificationRepository.createNotification({
          userId,
          title: reminder.title,
          body: reminder.body,
          type: reminder.type,
          scheduledFor: scheduledTime,
          deliveredAt: new Date(), // Immediate push emulation
        });

        // Log delivery history
        await this.notificationRepository.logNotificationDelivery(notification.id, true);
        generated.push(notification);
      }
    }

    return generated.map(item => this.mapNotification(item));
  }

  // Helpers to map DB objects to shared contract schemas
  private mapNotification(item: any): NotificationResponse {
    return {
      id: item.id,
      userId: item.userId,
      title: item.title,
      body: item.body,
      type: item.type,
      read: item.read,
      scheduledFor: item.scheduledFor ? item.scheduledFor.toISOString() : null,
      deliveredAt: item.deliveredAt ? item.deliveredAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private mapReminder(item: any): ReminderResponse {
    return {
      id: item.id,
      userId: item.userId,
      type: item.type,
      enabled: item.enabled,
      time: item.time,
      days: item.days,
      smart: item.smart,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private mapHabit(item: any): HabitResponse {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      streak: item.streak,
      completionRate: item.completionRate,
      targetFrequency: item.targetFrequency,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
export default NotificationsService;
