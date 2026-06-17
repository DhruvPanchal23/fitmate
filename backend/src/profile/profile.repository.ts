import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfile, BodyMeasurement, GoalHistory } from '../generated/prisma';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async createProfile(userId: string, data: any): Promise<UserProfile> {
    return this.prisma.userProfile.create({
      data: {
        userId,
        fullName: data.fullName,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        age: data.age,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        bodyFatPercentage: data.bodyFatPercentage ?? null,
        activityLevel: data.activityLevel,
        goal: data.goal,
        dietPreference: data.dietPreference,
        allergies: data.allergies || [],
        dislikedFoods: data.dislikedFoods || [],
        preferredFoods: data.preferredFoods || [],
        gymExperience: data.gymExperience,
        workoutDays: data.workoutDays,
        sleepHours: data.sleepHours,
        wakeUpTime: data.wakeUpTime,
        mealFrequency: data.mealFrequency,
        measurementSystem: data.measurementSystem || 'metric',
        medicalNotes: data.medicalNotes || null,
        version: 1,
        updatedBy: data.updatedBy || 'USER',
        lastCalculatedAt: new Date(),
      },
    });
  }

  async updateProfileWithConcurrency(
    userId: string,
    currentVersion: number,
    data: any
  ): Promise<UserProfile> {
    try {
      const updated = await this.prisma.userProfile.update({
        where: {
          userId,
          version: currentVersion,
        },
        data: {
          fullName: data.fullName,
          gender: data.gender,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          age: data.age,
          height: data.height,
          weight: data.weight,
          targetWeight: data.targetWeight,
          bodyFatPercentage: data.bodyFatPercentage ?? null,
          activityLevel: data.activityLevel,
          goal: data.goal,
          dietPreference: data.dietPreference,
          allergies: data.allergies,
          dislikedFoods: data.dislikedFoods,
          preferredFoods: data.preferredFoods,
          gymExperience: data.gymExperience,
          workoutDays: data.workoutDays,
          sleepHours: data.sleepHours,
          wakeUpTime: data.wakeUpTime,
          mealFrequency: data.mealFrequency,
          measurementSystem: data.measurementSystem,
          medicalNotes: data.medicalNotes,
          version: { increment: 1 },
          updatedBy: data.updatedBy || 'USER',
          lastCalculatedAt: new Date(),
        },
      });
      return updated;
    } catch (error) {
      throw new ConflictException(
        'Profile was updated by another process. Please reload and try again.'
      );
    }
  }

  async getLatestGoalHistory(userId: string): Promise<GoalHistory | null> {
    return this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGoalHistories(userId: string): Promise<GoalHistory[]> {
    return this.prisma.goalHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveGoalHistory(userId: string, data: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
    creatine: number;
    fiber: number;
    sugar: number;
    maintenanceCalories: number;
    tdee: number;
    bmr: number;
    calculationFormula: string;
    profileVersion: number;
    engineVersion: string;
    goalSnapshot: string;
  }): Promise<GoalHistory> {
    return this.prisma.goalHistory.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async saveBodyMeasurement(userId: string, data: any): Promise<BodyMeasurement> {
    return this.prisma.bodyMeasurement.create({
      data: {
        userId,
        weight: data.weight,
        bodyFat: data.bodyFat ?? null,
        waist: data.waist ?? null,
        chest: data.chest ?? null,
        arms: data.arms ?? null,
        thighs: data.thighs ?? null,
        neck: data.neck ?? null,
        hips: data.hips ?? null,
        shoulders: data.shoulders ?? null,
        forearms: data.forearms ?? null,
        calves: data.calves ?? null,
        notes: data.notes || null,
        source: data.source || 'USER',
      },
    });
  }

  async getBodyMeasurements(userId: string): Promise<BodyMeasurement[]> {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestBodyMeasurement(userId: string): Promise<BodyMeasurement | null> {
    return this.prisma.bodyMeasurement.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch today's logged water amount in ml/oz
  async getTodayWaterAmount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    // Sum it up in liters (converting ml to L)
    const totalMl = logs.reduce((sum, log) => {
      if (log.unit.toLowerCase() === 'oz') {
        return sum + log.amount * 29.5735; // oz to ml
      }
      return sum + log.amount;
    }, 0);

    return totalMl / 1000;
  }

  // Fetch today's logged calories from meals
  async getTodayCaloriesAmount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
      include: {
        items: true,
      },
    });

    return meals.reduce((sum, meal) => {
      const mealCal = meal.items.reduce((itemSum, item) => itemSum + item.calories, 0);
      return sum + mealCal;
    }, 0);
  }
}
export default ProfileRepository;
