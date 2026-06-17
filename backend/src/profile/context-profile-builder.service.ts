import { Injectable } from '@nestjs/common';
import { UserProfile, GoalHistory } from '../generated/prisma';

@Injectable()
export class ContextProfileBuilder {
  buildNormalizedProfile(profile: UserProfile, latestGoals: GoalHistory | null) {
    const goalsDecoded = latestGoals?.goalSnapshot
      ? JSON.parse(latestGoals.goalSnapshot)
      : null;

    return {
      userId: profile.userId,
      version: profile.version,
      fullName: profile.fullName,
      demographics: {
        gender: profile.gender,
        age: profile.age,
        birthDate: profile.birthDate,
        height: profile.height,
        weight: profile.weight,
        targetWeight: profile.targetWeight,
        bodyFatPercentage: profile.bodyFatPercentage,
      },
      lifestyle: {
        activityLevel: profile.activityLevel,
        sleepHours: profile.sleepHours,
        wakeUpTime: profile.wakeUpTime,
        mealFrequency: profile.mealFrequency,
        workoutDays: profile.workoutDays,
        gymExperience: profile.gymExperience,
      },
      nutrition: {
        dietPreference: profile.dietPreference,
        allergies: profile.allergies,
        dislikedFoods: profile.dislikedFoods,
        preferredFoods: profile.preferredFoods,
        measurementSystem: profile.measurementSystem,
        medicalNotes: profile.medicalNotes,
      },
      calculatedTargets: goalsDecoded
        ? {
            calories: goalsDecoded.targetCalories,
            protein: goalsDecoded.protein,
            carbs: goalsDecoded.carbs,
            fats: goalsDecoded.fats,
            water: goalsDecoded.water,
            creatine: goalsDecoded.creatine,
            fiber: goalsDecoded.fiber,
            sugar: goalsDecoded.sugar,
            bmi: goalsDecoded.bmi,
            tdee: goalsDecoded.tdee,
            bmr: goalsDecoded.bmr,
            formula: goalsDecoded.formula,
          }
        : null,
      lastCalculatedAt: profile.lastCalculatedAt,
    };
  }
}
export default ContextProfileBuilder;
