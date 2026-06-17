import { CompensationEngine } from './compensation-engine';

describe('CompensationEngine', () => {
  const engine = new CompensationEngine();

  it('should calculate compensation targets for a male with high surplus calories', () => {
    const results = engine.calculateCompensation({
      totalSurplusCalories: 3000,
      maintenanceCalories: 2500,
      gender: 'male',
      weight: 80,
      baseProtein: 150,
      baseCarbs: 250,
      baseFats: 70,
      baseWater: 3.0,
    });

    expect(results.recoveryCalorieTarget).toBeGreaterThanOrEqual(1500); // safety floor
    expect(results.recoveryDays).toBeLessThanOrEqual(14);
    expect(results.recommendedSteps).toBeGreaterThanOrEqual(10000);
    expect(results.waterTarget).toBe(3.5); // 3.0 + 0.5
    expect(results.proteinTarget).toBe(165); // max(150+15=165, 80*2.0=160) -> 165
  });

  it('should enforce deficit safety floor for female (1200 kcal)', () => {
    const results = engine.calculateCompensation({
      totalSurplusCalories: 1000,
      maintenanceCalories: 1300,
      gender: 'female',
      weight: 50,
      baseProtein: 90,
      baseCarbs: 150,
      baseFats: 40,
      baseWater: 2.0,
    });

    expect(results.recoveryCalorieTarget).toBe(1200); // Cap at safety floor of 1200
  });
});
