import { Injectable } from '@nestjs/common';
import { GoalEngineFacade } from './goal-engine.facade';
import { GOAL_ENGINE_VERSION } from './constants/goal-engine-version';
import { SmartGoalsResponse } from '../../../shared/contracts/goals';

@Injectable()
export class GoalCalculationService {
  private readonly cache = new Map<string, SmartGoalsResponse>();

  constructor(private readonly facade: GoalEngineFacade) {}

  async calculateGoals(
    userId: string,
    profile: {
      gender: string;
      age: number;
      weight: number;
      height: number;
      activityLevel: string;
      goal: string;
      dietPreference: string;
      gymExperience: string;
      bodyFatPercentage?: number | null;
      version: number;
      formula?: string;
    }
  ): Promise<SmartGoalsResponse> {
    const formula = profile.formula || 'mifflin';
    const cacheKey = `${userId}:${profile.version}:${GOAL_ENGINE_VERSION}:${formula}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const calculated = this.facade.calculateGoals({
      gender: profile.gender,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      dietPreference: profile.dietPreference,
      gymExperience: profile.gymExperience,
      bodyFatPercentage: profile.bodyFatPercentage,
      formula,
    });

    this.cache.set(cacheKey, calculated);
    return calculated;
  }

  // Explicit cache invalidation if needed
  invalidateCache(userId: string, version: number) {
    // Clear out old keys for this user
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}
export default GoalCalculationService;
