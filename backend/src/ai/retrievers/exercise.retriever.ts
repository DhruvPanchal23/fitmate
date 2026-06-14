import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExerciseRetriever {
  constructor(private readonly prisma: PrismaService) {}

  async retrieve(userId: string) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const workouts = await this.prisma.exerciseLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

      return {
        recentWorkouts: workouts.map((w) => ({
          activity: w.activityName,
          duration: w.durationMinutes,
          burned: w.caloriesBurned,
          date: w.createdAt.toISOString().split('T')[0],
        })),
        recentWorkoutsCount: workouts.length,
        totalCaloriesBurned: totalBurned,
      };
    } catch (e) {
      return {
        recentWorkouts: [],
        recentWorkoutsCount: 0,
        totalCaloriesBurned: 0,
      };
    }
  }
}
