import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class NotificationsRetriever {
  constructor(private readonly notificationsService: NotificationsService) {}

  async retrieve(userId: string) {
    try {
      const reminders = await this.notificationsService.getReminders(userId);
      const habits = await this.notificationsService.getHabits(userId);
      const analytics = await this.notificationsService.getHabitAnalytics(userId);

      const activeReminders = reminders.filter(r => r.enabled).map(r => r.type.replace('_', ' '));
      const strongest = habits.reduce((prev, current) => (prev.streak > current.streak ? prev : current), habits[0]);
      const weakest = habits.reduce((prev, current) => (prev.completionRate < current.completionRate ? prev : current), habits[0]);

      return {
        habitWeeklyScore: analytics.weeklyScore,
        habitMonthlyScore: analytics.monthlyScore,
        habitInsights: analytics.insights,
        activeReminders,
        strongestHabit: strongest ? { name: strongest.name, streak: strongest.streak } : null,
        weakestHabit: weakest ? { name: weakest.name, rate: weakest.completionRate } : null,
      };
    } catch (e) {
      return {
        habitWeeklyScore: 0,
        habitMonthlyScore: 0,
        habitInsights: [],
        activeReminders: [],
        strongestHabit: null,
        weakestHabit: null,
      };
    }
  }
}
export default NotificationsRetriever;
