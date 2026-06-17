export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  scheduledFor: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  type: string;
  scheduledFor?: string;
}

export interface ReminderResponse {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  time: string;
  days: number[];
  smart: boolean;
  createdAt: string;
}

export interface UpdateReminderRequest {
  id: string;
  enabled?: boolean;
  time?: string;
  days?: number[];
  smart?: boolean;
}

export interface HabitResponse {
  id: string;
  userId: string;
  name: string;
  streak: number;
  completionRate: number;
  targetFrequency: number;
  createdAt: string;
}

export interface HabitStreakResponse {
  habitId: string;
  name: string;
  streak: number;
}

export interface HabitAnalyticsResponse {
  weeklyScore: number;
  monthlyScore: number;
  completionPercentage: number;
  insights: string[];
}
