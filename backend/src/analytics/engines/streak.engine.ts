import { Injectable } from '@nestjs/common';
import { StreakResponse } from '../../../../shared/contracts/analytics';

@Injectable()
export class StreakEngine {
  calculateStreak(dates: Date[]): StreakResponse {
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
    }

    // De-duplicate dates by formatting to YYYY-MM-DD
    const uniqueDates = Array.from(
      new Set(dates.map((d) => new Date(d).toISOString().split('T')[0]))
    ).map((dStr) => new Date(dStr));

    // Sort ascending
    uniqueDates.sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      lastDate = currentDate;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate current streak: check if last active date is today or yesterday
    if (lastDate) {
      const lastActiveStr = lastDate.toISOString().split('T')[0];
      if (lastActiveStr === todayStr || lastActiveStr === yesterdayStr) {
        // Find streak working backwards from last active date
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    } else {
      currentStreak = 0;
    }

    return {
      currentStreak,
      longestStreak,
      lastActiveDate: lastDate ? lastDate.toISOString() : null,
    };
  }
}
export default StreakEngine;
