import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleEngine {
  constructor(private readonly prisma: PrismaService) {}

  async calculateScheduledTime(userId: string, reminderType: string): Promise<Date> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    // Default base hour values if profile or wakeUpTime is missing
    let wakeUpHour = 7;
    let wakeUpMinute = 0;

    if (profile && profile.wakeUpTime) {
      const parts = profile.wakeUpTime.split(':');
      wakeUpHour = parseInt(parts[0]) || 7;
      wakeUpMinute = parseInt(parts[1]) || 0;
    }

    // Check if active travel session is ongoing
    const activeTravel = await this.prisma.travelSession.findFirst({
      where: { userId, active: true },
    });

    let hourOffset = 0;
    switch (reminderType) {
      case 'meal_breakfast':
        // Breakfast is wake up time + 1 hour
        hourOffset = 1;
        break;
      case 'meal_lunch':
        // Spaced out based on meal frequency
        const mealFreq = profile?.mealFrequency || 3;
        hourOffset = mealFreq > 0 ? Math.round(12 / mealFreq) + 2 : 5; // e.g. 5-6 hours after wake up
        break;
      case 'meal_dinner':
        // Spaced out: evening, approx. 11 hours after wake up
        hourOffset = 11;
        break;
      case 'water':
        // Afternoon hydration nudge (wake up + 6 hours)
        hourOffset = 6;
        break;
      case 'exercise':
        // Workout reminder, typically early evening (wake up + 10 hours)
        hourOffset = 10;
        break;
      case 'sleep':
        // 16 hours after wake up is typical bed time (assuming 8 hours sleep)
        const sleepTarget = profile?.sleepHours || 8;
        hourOffset = 24 - sleepTarget;
        break;
      case 'measurement':
        // Overdue weigh-in: morning on empty stomach (wake up + 0.5 hours)
        hourOffset = 0.5;
        break;
      case 'planner':
        // AI Planner check-in (wake up + 2 hours)
        hourOffset = 2;
        break;
      case 'travel':
        // Travel local checks (midday)
        hourOffset = 5;
        break;
      case 'coach':
        // Coach interaction (wake up + 8 hours)
        hourOffset = 8;
        break;
      default:
        hourOffset = 4;
        break;
    }

    // Apply timezone/travel adjustments if travel session details exist
    let targetTime = new Date(startOfDay.getTime() + (wakeUpHour + hourOffset) * 60 * 60 * 1000 + wakeUpMinute * 60 * 1000);

    // If calculated time is already in the past, schedule it for the next day
    if (targetTime.getTime() <= now.getTime()) {
      targetTime = new Date(targetTime.getTime() + 24 * 60 * 60 * 1000);
    }

    return targetTime;
  }
}
export default ScheduleEngine;
