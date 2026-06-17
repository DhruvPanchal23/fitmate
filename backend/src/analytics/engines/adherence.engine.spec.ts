import { AdherenceEngine } from './adherence.engine';

describe('AdherenceEngine', () => {
  const engine = new AdherenceEngine();

  it('should return zeros if logs are empty', () => {
    const score = engine.calculateAdherence([]);
    expect(score).toEqual({ calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, overall: 0 });
  });

  it('should calculate perfect score when consumed equals target', () => {
    const score = engine.calculateAdherence([
      {
        caloriesConsumed: 2000,
        caloriesTarget: 2000,
        proteinConsumed: 150,
        proteinTarget: 150,
        carbsConsumed: 200,
        carbsTarget: 200,
        fatsConsumed: 70,
        fatsTarget: 70,
        waterConsumed: 3000,
        waterTarget: 3.0,
      },
    ]);

    expect(score.calories).toBe(100);
    expect(score.protein).toBe(100);
    expect(score.overall).toBe(100);
  });

  it('should calculate partial scores when consumed deviates from target', () => {
    const score = engine.calculateAdherence([
      {
        caloriesConsumed: 1800, // 90% (10% diff)
        caloriesTarget: 2000,
        proteinConsumed: 135, // 90% (10% diff)
        proteinTarget: 150,
        carbsConsumed: 180, // 90% (10% diff)
        carbsTarget: 200,
        fatsConsumed: 63, // 90% (10% diff)
        fatsTarget: 70,
        waterConsumed: 1500, // 50%
        waterTarget: 3.0,
      },
    ]);

    expect(score.calories).toBe(90);
    expect(score.protein).toBe(90);
    expect(score.water).toBe(50);
  });
});
