import { Injectable, BadRequestException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { GoalCalculationService } from './goal-calculation.service';
import { ProfileEventsBroker } from './profile-events.broker';
import { HealthScoreService } from './health-score.service';
import { ContextProfileBuilder } from './context-profile-builder.service';
import { ManualMeasurementProvider } from './providers/measurement-provider';
import { GOAL_ENGINE_VERSION } from './constants/goal-engine-version';
import {
  UpdateProfileRequest,
  CreateBodyMeasurementRequest,
  ProfileCompletionResponse,
  GoalRecommendationResponse,
} from '../../../shared/contracts/profile';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly calculationService: GoalCalculationService,
    private readonly eventsBroker: ProfileEventsBroker,
    private readonly healthScoreService: HealthScoreService,
    private readonly contextBuilder: ContextProfileBuilder,
    private readonly manualMeasurementProvider: ManualMeasurementProvider
  ) {
    // Subscribe to ProfileUpdated domain event
    this.eventsBroker.subscribe('ProfileUpdated', async (event: { userId: string; profile: any }) => {
      await this.handleProfileUpdatedEvent(event.userId, event.profile);
    });
  }

  // Validate profile bounds
  validateProfile(data: Partial<UpdateProfileRequest>) {
    const errors: string[] = [];

    if (data.age !== undefined && (data.age < 10 || data.age > 120)) {
      errors.push('Age must be between 10 and 120.');
    }
    if (data.height !== undefined && (data.height < 50 || data.height > 300)) {
      errors.push('Height must be between 50 and 300 cm.');
    }
    if (data.weight !== undefined && (data.weight < 20 || data.weight > 400)) {
      errors.push('Weight must be between 20 and 400 kg.');
    }
    if (
      data.bodyFatPercentage !== undefined &&
      data.bodyFatPercentage !== null &&
      (data.bodyFatPercentage < 2 || data.bodyFatPercentage > 70)
    ) {
      errors.push('Body fat percentage must be between 2% and 70%.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }
  }

  // Normalize imperial units to metric
  normalizeToMetric(data: any, system: 'metric' | 'imperial'): any {
    if (system === 'imperial') {
      const normalized = { ...data };
      if (data.height) normalized.height = Math.round(data.height * 2.54 * 10) / 10; // inches to cm
      if (data.weight) normalized.weight = Math.round(data.weight * 0.45359237 * 10) / 10; // lbs to kg
      if (data.targetWeight) normalized.targetWeight = Math.round(data.targetWeight * 0.45359237 * 10) / 10; // lbs to kg
      if (data.waist) normalized.waist = Math.round(data.waist * 2.54 * 10) / 10;
      if (data.neck) normalized.neck = Math.round(data.neck * 2.54 * 10) / 10;
      if (data.hips) normalized.hips = Math.round(data.hips * 2.54 * 10) / 10;
      if (data.shoulders) normalized.shoulders = Math.round(data.shoulders * 2.54 * 10) / 10;
      if (data.chest) normalized.chest = Math.round(data.chest * 2.54 * 10) / 10;
      if (data.arms) normalized.arms = Math.round(data.arms * 2.54 * 10) / 10;
      if (data.thighs) normalized.thighs = Math.round(data.thighs * 2.54 * 10) / 10;
      if (data.forearms) normalized.forearms = Math.round(data.forearms * 2.54 * 10) / 10;
      if (data.calves) normalized.calves = Math.round(data.calves * 2.54 * 10) / 10;
      return normalized;
    }
    return data;
  }

  // Denormalize metric to imperial for display/responses if requested
  denormalizeToImperial(data: any): any {
    const denormalized = { ...data };
    if (data.height) denormalized.height = Math.round((data.height / 2.54) * 10) / 10;
    if (data.weight) denormalized.weight = Math.round((data.weight / 0.45359237) * 10) / 10;
    if (data.targetWeight) denormalized.targetWeight = Math.round((data.targetWeight / 0.45359237) * 10) / 10;
    if (data.waist) denormalized.waist = Math.round((data.waist / 2.54) * 10) / 10;
    if (data.neck) denormalized.neck = Math.round((data.neck / 2.54) * 10) / 10;
    if (data.hips) denormalized.hips = Math.round((data.hips / 2.54) * 10) / 10;
    if (data.shoulders) denormalized.shoulders = Math.round((data.shoulders / 2.54) * 10) / 10;
    if (data.chest) denormalized.chest = Math.round((data.chest / 2.54) * 10) / 10;
    if (data.arms) denormalized.arms = Math.round((data.arms / 2.54) * 10) / 10;
    if (data.thighs) denormalized.thighs = Math.round((data.thighs / 2.54) * 10) / 10;
    if (data.forearms) denormalized.forearms = Math.round((data.forearms / 2.54) * 10) / 10;
    if (data.calves) denormalized.calves = Math.round((data.calves / 2.54) * 10) / 10;
    return denormalized;
  }

  // Calculate Profile Quality/Completion Scores
  async getCompletionScore(userId: string): Promise<ProfileCompletionResponse> {
    const profile = await this.repository.getProfileByUserId(userId);
    if (!profile) {
      return { completionScore: 0, aiReadinessScore: 0, isReadyForAI: false, missingFields: ['profile_not_created'] };
    }

    const missingFields: string[] = [];
    let basicCount = 0;
    const basicWeight = 30;
    if (profile.gender) basicCount++; else missingFields.push('gender');
    if (profile.birthDate) basicCount++; else missingFields.push('birthDate');
    if (profile.age) basicCount++; else missingFields.push('age');
    if (profile.height) basicCount++; else missingFields.push('height');
    if (profile.weight) basicCount++; else missingFields.push('weight');
    if (profile.targetWeight) basicCount++; else missingFields.push('targetWeight');
    const basicScore = (basicCount / 6) * basicWeight;

    let goalCount = 0;
    const goalWeight = 20;
    if (profile.goal) goalCount++; else missingFields.push('goal');
    if (profile.activityLevel) goalCount++; else missingFields.push('activityLevel');
    const goalScore = (goalCount / 2) * goalWeight;

    const measurements = await this.repository.getBodyMeasurements(userId);
    const measurementScore = measurements.length > 0 ? 20 : 0;
    if (measurements.length === 0) missingFields.push('body_measurements');

    let dietCount = 0;
    const dietWeight = 15;
    if (profile.dietPreference) dietCount++; else missingFields.push('dietPreference');
    if (profile.allergies.length > 0) dietCount++;
    if (profile.preferredFoods.length > 0) dietCount++;
    const dietScore = Math.min(15, (dietCount / 3) * dietWeight + (profile.dietPreference ? 10 : 0));

    let habitCount = 0;
    const habitWeight = 15;
    if (profile.gymExperience) habitCount++; else missingFields.push('gymExperience');
    if (profile.workoutDays !== undefined) habitCount++; else missingFields.push('workoutDays');
    if (profile.sleepHours) habitCount++; else missingFields.push('sleepHours');
    if (profile.wakeUpTime) habitCount++; else missingFields.push('wakeUpTime');
    if (profile.mealFrequency) habitCount++; else missingFields.push('mealFrequency');
    const habitScore = (habitCount / 5) * habitWeight;

    const completionScore = Math.round(basicScore + goalScore + measurementScore + dietScore + habitScore);
    const aiReadinessScore = completionScore; // Profile quality score is equivalent to AI readiness score

    return {
      completionScore,
      aiReadinessScore,
      isReadyForAI: aiReadinessScore >= 70,
      missingFields,
    };
  }

  // Get active health score
  async getHealthScore(userId: string) {
    const profile = await this.repository.getProfileByUserId(userId);
    if (!profile) {
      throw new BadRequestException('UserProfile not found');
    }

    const latestGoals = await this.repository.getLatestGoalHistory(userId);
    const todayWater = await this.repository.getTodayWaterAmount(userId);
    const todayCalories = await this.repository.getTodayCaloriesAmount(userId);

    const goalsDecoded = latestGoals?.goalSnapshot
      ? JSON.parse(latestGoals.goalSnapshot)
      : null;

    const targetCalories = goalsDecoded?.targetCalories || 2000;
    const targetWater = goalsDecoded?.water || 2.5;
    const bmi = goalsDecoded?.bmi || (profile.weight / ((profile.height / 100) * (profile.height / 100)));

    return this.healthScoreService.calculateHealthScore({
      bmi,
      activityLevel: profile.activityLevel,
      todayWaterLogged: todayWater,
      waterTarget: targetWater,
      todayCaloriesLogged: todayCalories,
      caloriesTarget: targetCalories,
      bodyFatPercentage: profile.bodyFatPercentage,
      gender: profile.gender,
      sleepHours: profile.sleepHours,
      workoutDays: profile.workoutDays,
    });
  }

  // Recommend Calorie recalculation if weight logs show large deviations
  async getGoalRecommendations(userId: string): Promise<GoalRecommendationResponse> {
    const profile = await this.repository.getProfileByUserId(userId);
    const latestSnapshot = await this.repository.getLatestGoalHistory(userId);
    
    if (!profile || !latestSnapshot) {
      return { shouldRecommendRecalculation: false, weightChange: 0, message: null };
    }

    const goalsDecoded = JSON.parse(latestSnapshot.goalSnapshot);
    const previousWeight = goalsDecoded.weight || profile.weight; // Fallback to current if missing in snapshot
    const currentWeight = profile.weight;

    const weightChange = Math.round((currentWeight - previousWeight) * 10) / 10;
    const shouldRecommendRecalculation = Math.abs(weightChange) >= 3.0; // dev >= 3kg

    return {
      shouldRecommendRecalculation,
      weightChange,
      message: shouldRecommendRecalculation
        ? `You have ${weightChange < 0 ? 'lost' : 'gained'} ${Math.abs(weightChange)} kg since your calorie targets were last computed. Would you like to recalculate your daily targets?`
        : null,
    };
  }

  // Async event handler to run calculation outside of update thread request
  private async handleProfileUpdatedEvent(userId: string, profile: any) {
    this.calculationService.invalidateCache(userId, profile.version);

    const goals = await this.calculationService.calculateGoals(userId, {
      ...profile,
      formula: profile.formula || 'mifflin',
    });

    // Add extra params to snapshot payload
    const fullSnapshot = {
      ...goals,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      dietPreference: profile.dietPreference,
      gymExperience: profile.gymExperience,
      bodyFatPercentage: profile.bodyFatPercentage,
      profileVersion: profile.version,
      engineVersion: GOAL_ENGINE_VERSION,
    };

    await this.repository.saveGoalHistory(userId, {
      calories: goals.targetCalories,
      protein: goals.protein,
      carbs: goals.carbs,
      fats: goals.fats,
      water: goals.water,
      creatine: goals.creatine,
      fiber: goals.fiber,
      sugar: goals.sugar,
      maintenanceCalories: goals.maintenanceCalories,
      tdee: goals.tdee,
      bmr: goals.bmr,
      calculationFormula: goals.formula,
      profileVersion: profile.version,
      engineVersion: GOAL_ENGINE_VERSION,
      goalSnapshot: JSON.stringify(fullSnapshot),
    });
  }

  // Fetch complete profile details (with target goals normalized)
  async getProfile(userId: string) {
    const profile = await this.repository.getProfileByUserId(userId);
    if (!profile) {
      return null;
    }

    const latestGoals = await this.repository.getLatestGoalHistory(userId);
    const normalized = this.contextBuilder.buildNormalizedProfile(profile, latestGoals);

    // If imperial preference, transform display values
    if (profile.measurementSystem === 'imperial') {
      return {
        ...this.denormalizeToImperial(normalized),
        measurementSystem: 'imperial',
        rawMetric: normalized, // Keep raw metric accessible
      };
    }

    return normalized;
  }

  // Save onboarding wizard draft
  async saveOnboardingDraft(userId: string, data: any) {
    // Validate bounds if basic fields are inputting
    this.validateProfile(data);
    const system = data.measurementSystem || 'metric';
    const normalizedData = this.normalizeToMetric(data, system);

    const existing = await this.repository.getProfileByUserId(userId);
    let profile;

    if (!existing) {
      // Create draft profile
      profile = await this.repository.createProfile(userId, {
        ...normalizedData,
        fullName: normalizedData.fullName || 'User Draft',
        age: normalizedData.age || 25,
        height: normalizedData.height || 170,
        weight: normalizedData.weight || 70,
        targetWeight: normalizedData.targetWeight || 70,
        activityLevel: normalizedData.activityLevel || 'sedentary',
        goal: normalizedData.goal || 'maintenance',
        dietPreference: normalizedData.dietPreference || 'non_veg',
        gymExperience: normalizedData.gymExperience || 'beginner',
        workoutDays: normalizedData.workoutDays || 0,
        sleepHours: normalizedData.sleepHours || 8,
        wakeUpTime: normalizedData.wakeUpTime || '07:00',
        mealFrequency: normalizedData.mealFrequency || 3,
        updatedBy: 'USER',
      });
    } else {
      profile = await this.repository.updateProfileWithConcurrency(userId, existing.version, {
        ...normalizedData,
        fullName: normalizedData.fullName || existing.fullName,
        age: normalizedData.age || existing.age,
        height: normalizedData.height || existing.height,
        weight: normalizedData.weight || existing.weight,
        targetWeight: normalizedData.targetWeight || existing.targetWeight,
        activityLevel: normalizedData.activityLevel || existing.activityLevel,
        goal: normalizedData.goal || existing.goal,
        dietPreference: normalizedData.dietPreference || existing.dietPreference,
        gymExperience: normalizedData.gymExperience || existing.gymExperience,
        workoutDays: normalizedData.workoutDays !== undefined ? normalizedData.workoutDays : existing.workoutDays,
        sleepHours: normalizedData.sleepHours || existing.sleepHours,
        wakeUpTime: normalizedData.wakeUpTime || existing.wakeUpTime,
        mealFrequency: normalizedData.mealFrequency || existing.mealFrequency,
        updatedBy: 'USER',
      });
    }

    // Trigger calculations asynchronously if calculation parameters exist
    if (data.weight && data.height && data.age && data.activityLevel && data.goal) {
      await this.eventsBroker.emit('ProfileUpdated', { userId, profile });
    }

    return profile;
  }

  // Update profile endpoint
  async updateProfile(userId: string, data: UpdateProfileRequest) {
    this.validateProfile(data);
    
    const existing = await this.repository.getProfileByUserId(userId);
    if (!existing) {
      // Create profile
      const normalizedData = this.normalizeToMetric(data, data.measurementSystem || 'metric');
      const profile = await this.repository.createProfile(userId, normalizedData);
      await this.eventsBroker.emit('ProfileUpdated', { userId, profile });
      return profile;
    }

    const system = data.measurementSystem || existing.measurementSystem || 'metric';
    const normalizedData = this.normalizeToMetric(data, system as any);

    const profile = await this.repository.updateProfileWithConcurrency(userId, existing.version, normalizedData);

    // Emit event asynchronously to trigger GoalEngineFacade recalculation
    await this.eventsBroker.emit('ProfileUpdated', { userId, profile });

    return profile;
  }

  // Log a body measurement
  async logBodyMeasurement(userId: string, data: CreateBodyMeasurementRequest) {
    const profile = await this.repository.getProfileByUserId(userId);
    const system = profile?.measurementSystem || 'metric';

    const processedData = await this.manualMeasurementProvider.process(userId, data);
    const normalized = this.normalizeToMetric(processedData, system as any);

    const logged = await this.repository.saveBodyMeasurement(userId, normalized);

    // If weight has changed, check if we should update profile weight too
    if (normalized.weight && profile && normalized.weight !== profile.weight) {
      await this.repository.updateProfileWithConcurrency(userId, profile.version, {
        ...profile,
        weight: normalized.weight,
        updatedBy: 'SYSTEM',
      });
      // Invalidate cache and trigger recalculation via event
      const updatedProfile = await this.repository.getProfileByUserId(userId);
      await this.eventsBroker.emit('ProfileUpdated', { userId, profile: updatedProfile });
    }

    return logged;
  }

  // Get historical measurement list
  async getBodyMeasurements(userId: string) {
    const profile = await this.repository.getProfileByUserId(userId);
    const system = profile?.measurementSystem || 'metric';
    const logs = await this.repository.getBodyMeasurements(userId);

    if (system === 'imperial') {
      return logs.map((log) => this.denormalizeToImperial(log));
    }
    return logs;
  }

  // Calculate timeseries trends for Weight
  async getWeightProgress(userId: string) {
    const logs = await this.getBodyMeasurements(userId);
    const reversed = [...logs].reverse();

    const points = reversed.map((log) => ({
      date: new Date(log.createdAt).toISOString().split('T')[0],
      value: log.weight,
    }));

    const trend = this.calculateTimeSeriesTrends(points);

    return {
      metric: 'Weight',
      unit: (await this.repository.getProfileByUserId(userId))?.measurementSystem === 'imperial' ? 'lbs' : 'kg',
      points,
      trend,
    };
  }

  // Calculate timeseries trends for Body Fat
  async getBodyFatProgress(userId: string) {
    const logs = await this.getBodyMeasurements(userId);
    const reversed = [...logs].reverse();

    const points = reversed
      .filter((log) => log.bodyFat !== null)
      .map((log) => ({
        date: new Date(log.createdAt).toISOString().split('T')[0],
        value: log.bodyFat!,
      }));

    const trend = this.calculateTimeSeriesTrends(points);

    return {
      metric: 'Body Fat',
      unit: '%',
      points,
      trend,
    };
  }

  // Calculate timeseries trends for individual body measurements
  async getMeasurementsProgress(userId: string) {
    const logs = await this.getBodyMeasurements(userId);
    const reversed = [...logs].reverse();
    const unit = (await this.repository.getProfileByUserId(userId))?.measurementSystem === 'imperial' ? 'in' : 'cm';

    const buildPoints = (extractor: (log: any) => number | null) => {
      return reversed
        .filter((l) => extractor(l) !== null)
        .map((l) => ({
          date: new Date(l.createdAt).toISOString().split('T')[0],
          value: extractor(l)!,
        }));
    };

    return {
      waist: { metric: 'Waist', unit, points: buildPoints((l) => l.waist), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.waist)) },
      hips: { metric: 'Hips', unit, points: buildPoints((l) => l.hips), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.hips)) },
      neck: { metric: 'Neck', unit, points: buildPoints((l) => l.neck), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.neck)) },
      shoulders: { metric: 'Shoulders', unit, points: buildPoints((l) => l.shoulders), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.shoulders)) },
      chest: { metric: 'Chest', unit, points: buildPoints((l) => l.chest), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.chest)) },
      arms: { metric: 'Arms', unit, points: buildPoints((l) => l.arms), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.arms)) },
      forearms: { metric: 'Forearms', unit, points: buildPoints((l) => l.forearms), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.forearms)) },
      thighs: { metric: 'Thighs', unit, points: buildPoints((l) => l.thighs), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.thighs)) },
      calves: { metric: 'Calves', unit, points: buildPoints((l) => l.calves), trend: this.calculateTimeSeriesTrends(buildPoints((l) => l.calves)) },
    };
  }

  // Calculate rolling change, weekly change, monthly change, and projected date
  private calculateTimeSeriesTrends(points: Array<{ date: string; value: number }>) {
    if (points.length < 2) {
      return {
        weeklyChange: 0,
        monthlyChange: 0,
        averageGainLoss: 0,
        rollingAverage: points.length === 1 ? points[0].value : 0,
        projectedTargetDate: null,
      };
    }

    const latest = points[points.length - 1].value;
    const startValue = points[0].value;
    const totalDiff = latest - startValue;

    // Calculate rolling average of last 3 points
    const lastThree = points.slice(-3);
    const rollingAverage = Math.round((lastThree.reduce((sum, p) => sum + p.value, 0) / lastThree.length) * 10) / 10;

    // Calculate weekly / monthly change estimates based on timestamps
    const daysRange = (new Date(points[points.length - 1].date).getTime() - new Date(points[0].date).getTime()) / (1000 * 60 * 60 * 24);
    const weeklyRate = daysRange > 0 ? (totalDiff / daysRange) * 7 : totalDiff;
    const monthlyRate = daysRange > 0 ? (totalDiff / daysRange) * 30 : totalDiff;

    return {
      weeklyChange: Math.round(weeklyRate * 10) / 10,
      monthlyChange: Math.round(monthlyRate * 10) / 10,
      averageGainLoss: Math.round((totalDiff / points.length) * 10) / 10,
      rollingAverage,
      projectedTargetDate: null, // Custom goal tracker can set this
    };
  }
}
export default ProfileService;
