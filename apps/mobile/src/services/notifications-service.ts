import { apiClient } from './api-client';
import {
  NotificationResponse,
  ReminderResponse,
  UpdateReminderRequest,
  HabitResponse,
  HabitStreakResponse,
  HabitAnalyticsResponse,
} from '../../../../shared/contracts';

export const notificationsService = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    return apiClient.get<NotificationResponse[]>('/notifications');
  },

  markAsRead: async (notificationIds?: string[]): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>('/notifications/read', { notificationIds });
  },

  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/notifications/${id}`);
  },

  getReminders: async (): Promise<ReminderResponse[]> => {
    return apiClient.get<ReminderResponse[]>('/reminders');
  },

  updateReminder: async (data: UpdateReminderRequest): Promise<ReminderResponse> => {
    return apiClient.patch<ReminderResponse>('/reminders', data);
  },

  getHabits: async (): Promise<HabitResponse[]> => {
    return apiClient.get<HabitResponse[]>('/habits');
  },

  getHabitStreaks: async (): Promise<HabitStreakResponse[]> => {
    return apiClient.get<HabitStreakResponse[]>('/habits/streaks');
  },

  getHabitAnalytics: async (): Promise<HabitAnalyticsResponse> => {
    return apiClient.get<HabitAnalyticsResponse>('/habits/analytics');
  },
};

export default notificationsService;
