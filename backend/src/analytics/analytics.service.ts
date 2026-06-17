import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { InsightRepository } from './repositories/insight.repository';
import { RecommendationRepository } from './repositories/recommendation.repository';

// Import engines
import { AdherenceEngine } from './engines/adherence.engine';
import { ConsistencyEngine } from './engines/consistency.engine';
import { StreakEngine } from './engines/streak.engine';
import { TrendEngine } from './engines/trend.engine';
import { PredictionEngine } from './engines/prediction.engine';
import { HealthScoreEngine } from './engines/health-score.engine';
import { RiskEngine } from './engines/risk.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsRepo: AnalyticsRepository,
    private readonly insightRepo: InsightRepository,
    private readonly recommendationRepo: RecommendationRepository,
    private readonly adherenceEngine: AdherenceEngine,
    private readonly consistencyEngine: ConsistencyEngine,
    private readonly streakEngine: StreakEngine,
    private readonly trendEngine: TrendEngine,
    private readonly predictionEngine: PredictionEngine,
    private readonly healthScoreEngine: HealthScoreEngine,
    private readonly riskEngine: RiskEngine,
    private readonly recommendationEngine: RecommendationEngine,
  ) {}

  async syncAnalytics(userId: string): Promise<void> {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const targetCal = latestGoal?.calories || 2000;
    const targetProt = latestGoal?.protein || 130;
    const targetCarbs = latestGoal?.carbs || 220;
    const targetFats = latestGoal?.fats || 70;
    const targetWater = latestGoal?.water || 2.5;

    // Sync last 14 days
    const today = new Date();
    const startRange = new Date(today);
    startRange.setDate(startRange.getDate() - 13);
    startRange.setUTCHours(0, 0, 0, 0);

    const endRange = new Date(today);
    endRange.setUTCHours(23, 59, 59, 999);

    // Bulk fetch all tables for the range in a single operation
    const [allMeals, allWaterLogs, allExercises, allMeasurements, reminderAdherence] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId, createdAt: { gte: startRange, lte: endRange } },
        include: { items: true },
      }),
      this.prisma.waterLog.findMany({
        where: { userId, createdAt: { gte: startRange, lte: endRange } },
      }),
      this.prisma.exerciseLog.findMany({
        where: { userId, createdAt: { gte: startRange, lte: endRange } },
      }),
      this.prisma.bodyMeasurement.findMany({
        where: { userId, createdAt: { gte: startRange, lte: endRange } },
        orderBy: { createdAt: 'desc' },
      }),
      this.getReminderAdherence(userId),
    ]);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const startMs = startOfDay.getTime();
      const endMs = endOfDay.getTime();

      // Aggregate calories/macros in memory
      const meals = allMeals.filter((m) => {
        const time = new Date(m.createdAt).getTime();
        return time >= startMs && time <= endMs;
      });

      let caloriesConsumed = 0;
      let proteinConsumed = 0;
      let carbsConsumed = 0;
      let fatsConsumed = 0;
      meals.forEach((m) => {
        m.items.forEach((item) => {
          caloriesConsumed += item.calories;
          proteinConsumed += item.protein;
          carbsConsumed += item.carbohydrates;
          fatsConsumed += item.fats;
        });
      });

      // Water logs in memory
      const waterLogs = allWaterLogs.filter((w) => {
        const time = new Date(w.createdAt).getTime();
        return time >= startMs && time <= endMs;
      });
      const waterConsumed = waterLogs.reduce((sum, w) => sum + w.amount, 0);

      // Workouts in memory
      const exercises = allExercises.filter((e) => {
        const time = new Date(e.createdAt).getTime();
        return time >= startMs && time <= endMs;
      });
      const workoutCalories = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

      // Weight in memory
      const measurement = allMeasurements.find((m) => {
        const time = new Date(m.createdAt).getTime();
        return time >= startMs && time <= endMs;
      });

      // Calculate temporary adherence and consistency scores
      const adherence = this.adherenceEngine.calculateAdherence([
        {
          caloriesConsumed,
          caloriesTarget: targetCal,
          proteinConsumed,
          proteinTarget: targetProt,
          carbsConsumed,
          carbsTarget: targetCarbs,
          fatsConsumed,
          fatsTarget: targetFats,
          waterConsumed,
          waterTarget: targetWater,
        },
      ]);

      const consistency = this.consistencyEngine.calculateConsistency([
        {
          hasMealLog: meals.length > 0,
          hasWaterLog: waterLogs.length > 0,
          hasExerciseLog: exercises.length > 0,
        },
      ]);

      const blendedAdherence = Math.round(adherence.overall * 0.8 + reminderAdherence * 0.2);
      const blendedConsistency = Math.round(consistency * 0.8 + reminderAdherence * 0.2);

      // Calculate health score contribution
      const bmi = profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 22;
      const scoreRes = this.healthScoreEngine.calculateScore({
        bmi,
        activityLevel: profile.activityLevel,
        waterAdherence: adherence.water,
        calorieAdherence: adherence.calories,
        bodyFatPercentage: profile.bodyFatPercentage,
        gender: profile.gender,
        sleepHours: profile.sleepHours || 7,
        workoutDays: profile.workoutDays || 3,
        consistencyScore: blendedConsistency,
        reminderAdherence,
        history: [],
      });

      // Save daily snapshot
      await this.analyticsRepo.saveSnapshot({
        userId,
        date: d,
        healthScore: scoreRes.score,
        consistencyScore: blendedConsistency,
        adherenceScore: blendedAdherence,
        weight: measurement?.weight || profile.weight,
        bodyFat: measurement?.bodyFat || profile.bodyFatPercentage,
        caloriesConsumed,
        caloriesTarget: targetCal,
        proteinConsumed,
        proteinTarget: targetProt,
        carbsConsumed,
        carbsTarget: targetCarbs,
        fatsConsumed,
        fatsTarget: targetFats,
        waterConsumed,
        waterTarget: targetWater,
        steps: 7000 + Math.floor(Math.random() * 4000), // mock steps
        workoutCalories,
      });
    }

    // After syncing daily snapshots, evaluate risks, generate recommendations & insights
    await this.runRulesEngine(userId, profile, targetCal, targetProt, targetWater);
  }

  private async runRulesEngine(userId: string, profile: any, targetCal: number, targetProt: number, targetWater: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);

    const snapshots = await this.analyticsRepo.findSnapshots(userId, start, end);
    if (snapshots.length === 0) return;

    // Averages
    const avgCalConsumed = snapshots.reduce((sum, s) => sum + s.caloriesConsumed, 0) / snapshots.length;
    const avgProtConsumed = snapshots.reduce((sum, s) => sum + s.proteinConsumed, 0) / snapshots.length;
    const avgWaterConsumed = snapshots.reduce((sum, s) => sum + s.waterConsumed, 0) / snapshots.length; // ml
    const avgSteps = snapshots.reduce((sum, s) => sum + s.steps, 0) / snapshots.length;

    // Check weight logs
    const weightLogs = await this.prisma.bodyMeasurement.findMany({
      where: { userId, createdAt: { gte: start } },
      orderBy: { createdAt: 'asc' },
    });
    
    // Weight diff in last 7 days
    let recentWeightLossKg = 0;
    if (weightLogs.length >= 2) {
      const first = weightLogs[0].weight;
      const last = weightLogs[weightLogs.length - 1].weight;
      recentWeightLossKg = Math.max(0, first - last);
    }

    // 1. Risks
    const risks = this.riskEngine.analyzeRisk({
      caloriesConsumed: avgCalConsumed,
      caloriesTarget: targetCal,
      proteinConsumed: avgProtConsumed,
      weight: profile.weight,
      gender: profile.gender,
      recentWeightLossKg,
    });

    // 2. Predictions & Plateau detection
    const weightHistory = weightLogs.map(w => ({ date: w.createdAt, weight: w.weight }));
    const predictions = this.predictionEngine.predict(
      profile.weight,
      profile.targetWeight || profile.weight,
      snapshots.map(s => ({ caloriesConsumed: s.caloriesConsumed, caloriesTarget: s.caloriesTarget })),
      weightHistory,
    );

    // 3. Generate Recommendations
    const recs = this.recommendationEngine.generateRecommendations({
      averageWaterLiters: avgWaterConsumed / 1000,
      waterTargetLiters: targetWater,
      averageSteps: avgSteps,
      averageProteinGrams: Math.round(avgProtConsumed),
      targetProteinGrams: targetProt,
      sleepHours: profile.sleepHours || 7,
      plateauDetected: predictions.plateauDetected,
    });

    await this.recommendationRepo.saveRecommendations(userId, recs);

    // 4. Generate Insights
    if (predictions.plateauDetected) {
      await this.insightRepo.saveInsight({
        userId,
        title: 'Weight Progress Plateau Detected',
        description: `Your weight has stayed flat for ${predictions.plateauDurationDays} days. Consider cycling your calories or increasing workout intensity.`,
        category: 'plateau',
        value: predictions.plateauDurationDays,
      });
    }

    if (risks.length > 0) {
      for (const risk of risks) {
        await this.insightRepo.saveInsight({
          userId,
          title: `Risk Alert: ${risk.type.replace('_', ' ')}`,
          description: risk.description,
          category: 'risk',
        });
      }
    }
  }

  async getDashboard(userId: string) {
    await this.syncAnalytics(userId);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const snapshots = await this.analyticsRepo.findSnapshots(userId, start, end);
    
    // Average scores
    let healthScore = 75;
    let consistencyScore = 80;
    let adherenceScore = 70;
    if (snapshots.length > 0) {
      healthScore = Math.round(snapshots.reduce((sum, s) => sum + s.healthScore, 0) / snapshots.length);
      consistencyScore = Math.round(snapshots.reduce((sum, s) => sum + s.consistencyScore, 0) / snapshots.length);
      adherenceScore = Math.round(snapshots.reduce((sum, s) => sum + s.adherenceScore, 0) / snapshots.length);
    }

    // Get current streak
    const streakRes = await this.getStreaks(userId);
    const currentStreak = streakRes.mealStreak.currentStreak;

    // Predictions
    const predictions = await this.getPredictions(userId);

    // Recs & Insights
    const recommendations = await this.getRecommendations(userId);
    const insights = await this.getInsights(userId);

    // Get active risks
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const avgCalConsumed = snapshots.length > 0 ? snapshots.reduce((sum, s) => sum + s.caloriesConsumed, 0) / snapshots.length : 0;
    const avgProtConsumed = snapshots.length > 0 ? snapshots.reduce((sum, s) => sum + s.proteinConsumed, 0) / snapshots.length : 0;
    
    const riskAlerts = this.riskEngine.analyzeRisk({
      caloriesConsumed: avgCalConsumed,
      caloriesTarget: latestGoal?.calories || 2000,
      proteinConsumed: avgProtConsumed,
      weight: profile?.weight || 70,
      gender: profile?.gender || 'male',
      recentWeightLossKg: 0,
    });

    return {
      healthScore,
      consistencyScore,
      adherenceScore,
      currentStreak,
      weightPrediction: predictions.predictedWeight30Days,
      recommendations,
      insights,
      riskAlerts,
    };
  }

  async getTrends(userId: string) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const snapshots = await this.analyticsRepo.findSnapshots(userId, start, end);
    return this.trendEngine.processTrends(snapshots);
  }

  async getStreaks(userId: string) {
    const mealLogs = await this.prisma.meal.findMany({
      where: { userId },
      select: { createdAt: true },
    });
    const waterLogs = await this.prisma.waterLog.findMany({
      where: { userId },
      select: { createdAt: true },
    });
    const exerciseLogs = await this.prisma.exerciseLog.findMany({
      where: { userId },
      select: { createdAt: true },
    });

    return {
      mealStreak: this.streakEngine.calculateStreak(mealLogs.map(m => m.createdAt)),
      workoutStreak: this.streakEngine.calculateStreak(exerciseLogs.map(e => e.createdAt)),
      hydrationStreak: this.streakEngine.calculateStreak(waterLogs.map(w => w.createdAt)),
    };
  }

  async getAdherence(userId: string) {
    const end = new Date();
    const startWeekly = new Date();
    startWeekly.setDate(startWeekly.getDate() - 7);
    const startMonthly = new Date();
    startMonthly.setDate(startMonthly.getDate() - 30);

    const weeklySnaps = await this.analyticsRepo.findSnapshots(userId, startWeekly, end);
    const monthlySnaps = await this.analyticsRepo.findSnapshots(userId, startMonthly, end);

    return {
      weeklyAdherence: this.adherenceEngine.calculateAdherence(weeklySnaps),
      monthlyAdherence: this.adherenceEngine.calculateAdherence(monthlySnaps),
    };
  }

  async getHealthScore(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const latestGoal = await this.prisma.goalHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);

    const snapshots = await this.analyticsRepo.findSnapshots(userId, start, end);
    const avgCalConsumed = snapshots.length > 0 ? snapshots.reduce((sum, s) => sum + s.caloriesConsumed, 0) / snapshots.length : 0;
    const avgWaterConsumed = snapshots.length > 0 ? snapshots.reduce((sum, s) => sum + s.waterConsumed, 0) / snapshots.length : 0;
    
    const adherence = this.adherenceEngine.calculateAdherence(snapshots);
    const consistency = this.consistencyEngine.calculateConsistency(
      snapshots.map(s => ({ hasMealLog: s.caloriesConsumed > 0, hasWaterLog: s.waterConsumed > 0, hasExerciseLog: s.workoutCalories > 0 }))
    );

    const reminderAdherence = await this.getReminderAdherence(userId);
    const blendedConsistency = Math.round(consistency * 0.8 + reminderAdherence * 0.2);
    const bmi = profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 22;

    const scoreRes = this.healthScoreEngine.calculateScore({
      bmi,
      activityLevel: profile.activityLevel,
      waterAdherence: adherence.water,
      calorieAdherence: adherence.calories,
      bodyFatPercentage: profile.bodyFatPercentage,
      gender: profile.gender,
      sleepHours: profile.sleepHours || 7,
      workoutDays: profile.workoutDays || 3,
      consistencyScore: blendedConsistency,
      reminderAdherence,
      history: snapshots.map(s => ({ date: s.date, score: s.healthScore })),
    });

    return scoreRes;
  }

  async getPredictions(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);

    const snapshots = await this.analyticsRepo.findSnapshots(userId, start, end);
    const weightHistoryLogs = await this.prisma.bodyMeasurement.findMany({
      where: { userId, createdAt: { gte: start } },
      orderBy: { createdAt: 'asc' },
    });

    const weightHistory = weightHistoryLogs.map(w => ({ date: w.createdAt, weight: w.weight }));

    return this.predictionEngine.predict(
      profile.weight,
      profile.targetWeight || profile.weight,
      snapshots.map(s => ({ caloriesConsumed: s.caloriesConsumed, caloriesTarget: s.caloriesTarget })),
      weightHistory,
    );
  }

  async getRecommendations(userId: string) {
    const recs = await this.recommendationRepo.findRecommendations(userId);
    return recs.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      actionUrl: r.actionUrl || undefined,
      implemented: r.implemented,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getInsights(userId: string) {
    const insights = await this.insightRepo.findInsights(userId);
    return insights.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category,
      value: i.value || undefined,
      dismissed: i.dismissed,
      createdAt: i.createdAt.toISOString(),
    }));
  }

  async dismissInsight(userId: string, insightId: string) {
    const insight = await this.prisma.insight.findUnique({ where: { id: insightId } });
    if (!insight || insight.userId !== userId) {
      throw new NotFoundException('Insight not found');
    }
    await this.insightRepo.dismissInsight(insightId);
    return { success: true };
  }

  private async getReminderAdherence(userId: string): Promise<number> {
    try {
      const history = await this.prisma.notificationHistory.findMany({
        where: {
          notification: {
            userId,
            type: {
              in: [
                'meal_breakfast',
                'meal_lunch',
                'meal_dinner',
                'water',
                'exercise',
                'sleep',
                'measurement',
                'planner',
                'travel',
                'coach',
              ],
            },
          },
        },
        take: 30,
      });

      if (history.length === 0) {
        return 85; // Default high starting adherence
      }

      const completed = history.filter((h) => h.opened || h.actionTaken).length;
      return Math.round((completed / history.length) * 100);
    } catch {
      return 85;
    }
  }
}
export default AnalyticsService;
