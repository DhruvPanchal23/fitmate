import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReminderEngine {
  constructor(private readonly prisma: PrismaService) {}

  async checkAndGenerateReminders(userId: string): Promise<Array<{ title: string; body: string; type: string }>> {
    const reminders: Array<{ title: string; body: string; type: string }> = [];

    // Get current date/time context
    const now = new Date();
    const currentHour = now.getHours();

    // 1. Quiet Hours check (10:00 PM to 7:00 AM)
    if (currentHour >= 22 || currentHour < 7) {
      return []; // Do not send reminders during quiet hours
    }

    // Fetch user profile and logs for context
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // If profile is completely missing, generate profile incomplete reminder
      reminders.push({
        title: 'Complete your Profile',
        body: 'Welcome to FitMate! Please complete your profile Wizard so we can calculate your personalized goals.',
        type: 'profile_incomplete',
      });
      return reminders;
    }

    // Check for essential missing details in profile
    if (!profile.height || !profile.weight || !profile.activityLevel || !profile.goal) {
      reminders.push({
        title: 'Profile Incomplete',
        body: 'Please fill in your height, weight, and goals in settings to get accurate calorie calculations.',
        type: 'profile_incomplete',
      });
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch meals logged today
    const mealsToday = await this.prisma.meal.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Determine wake-up time base
    const wakeUpHour = profile.wakeUpTime ? parseInt(profile.wakeUpTime.split(':')[0]) : 7;

    // Check breakfast (wakeUpHour + 2 hours)
    if (currentHour >= wakeUpHour + 2 && currentHour < wakeUpHour + 5) {
      const hasBreakfast = mealsToday.some(m => m.mealType.toLowerCase() === 'breakfast');
      if (!hasBreakfast) {
        reminders.push({
          title: 'Log Breakfast',
          body: "Don't forget to track your breakfast! Keeping an accurate food log is key to reaching your goals.",
          type: 'meal_breakfast',
        });
      }
    }

    // Check lunch (wakeUpHour + 6 hours)
    if (currentHour >= wakeUpHour + 6 && currentHour < wakeUpHour + 9) {
      const hasLunch = mealsToday.some(m => m.mealType.toLowerCase() === 'lunch');
      if (!hasLunch) {
        reminders.push({
          title: 'Time for Lunch?',
          body: 'Remember to log your lunch and check your protein target for the afternoon.',
          type: 'meal_lunch',
        });
      }
    }

    // Check dinner (wakeUpHour + 12 hours)
    if (currentHour >= wakeUpHour + 12) {
      const hasDinner = mealsToday.some(m => m.mealType.toLowerCase() === 'dinner');
      if (!hasDinner) {
        reminders.push({
          title: 'Dinner Tracker',
          body: 'Wind down your day by logging your dinner. Make sure to lock in those macros!',
          type: 'meal_dinner',
        });
      }
    }

    // 2. Hydration Check
    const waterToday = await this.prisma.waterLog.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { amount: true },
    });
    const loggedWater = waterToday._sum.amount || 0;
    // Base target (default 2500ml)
    const waterTarget = 2500;
    if (currentHour >= 14 && loggedWater < waterTarget * 0.5) {
      reminders.push({
        title: 'Stay Hydrated',
        body: `You have only logged ${loggedWater}ml of water today. Grab a glass and stay hydrated!`,
        type: 'water',
      });
    }

    // 3. Exercise Check
    const exerciseToday = await this.prisma.exerciseLog.findFirst({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });
    // Check if it is a workout day (e.g. today is workout day based on target workoutDays)
    if (profile.workoutDays && profile.workoutDays > 0) {
      // Simple heuristic: if it's 6 PM and no exercise logged, remind
      if (currentHour >= 18 && !exerciseToday) {
        reminders.push({
          title: 'Ready to Move?',
          body: "You haven't logged a workout today. A quick 20-minute exercise session will keep you on track!",
          type: 'exercise',
        });
      }
    }

    // 4. Planner Meal Pending
    const activePlan = await this.prisma.mealPlan.findFirst({
      where: { userId, status: 'active' },
      include: {
        days: {
          include: {
            meals: true,
          },
        },
      },
    });
    if (activePlan) {
      const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday...
      const daysOfWeekNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayName = daysOfWeekNames[todayDayOfWeek];

      const todayPlanDay = activePlan.days.find(d => d.dayOfWeek.toLowerCase() === currentDayName);
      if (todayPlanDay) {
        const pendingMeals = todayPlanDay.meals.filter(m => m.status.toLowerCase() === 'planned');
        if (pendingMeals.length > 0) {
          reminders.push({
            title: 'Planner Meal Reminder',
            body: `You have ${pendingMeals.length} planned meals remaining to complete in your AI Meal Plan today.`,
            type: 'planner',
          });
        }
      }
    }

    // 5. Travel Recovery Pending
    const activeCompensation = await this.prisma.compensationPlan.findFirst({
      where: { userId, status: 'active' },
    });
    if (activeCompensation) {
      reminders.push({
        title: 'Travel Recovery Plan Active',
        body: 'Keep moving! Stick to your travel recovery target deficit and steps to stay on course.',
        type: 'travel',
      });
    }

    // 6. AI Inactivity
    const lastMessage = await this.prisma.conversationMessage.findFirst({
      where: {
        conversation: { userId },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (lastMessage) {
      const diffTime = Math.abs(now.getTime() - lastMessage.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) {
        reminders.push({
          title: 'Chat with AI Coach',
          body: "Your AI Coach misses you! Open chat to review your progress or ask for a recovery strategy.",
          type: 'coach',
        });
      }
    }

    // 7. Body Measurement Overdue
    const lastMeasurement = await this.prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (lastMeasurement) {
      const diffTime = Math.abs(now.getTime() - lastMeasurement.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        reminders.push({
          title: 'Record Body Measurements',
          body: 'It has been over a week since your last weight update. Log it now to refine your AI predictions!',
          type: 'measurement',
        });
      }
    } else {
      reminders.push({
        title: 'Record your Initial Weight',
        body: 'Log your current weight today to start tracking your health trends and predictions.',
        type: 'measurement',
      });
    }

    return reminders;
  }
}
export default ReminderEngine;
