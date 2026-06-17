import { HealthScoreEngine } from './health-score.engine';

describe('HealthScoreEngine', () => {
  const engine = new HealthScoreEngine();

  it('should calculate health score correctly under normal inputs', () => {
    const inputs = {
      bmi: 22.5,
      activityLevel: 'moderate',
      waterAdherence: 90,
      calorieAdherence: 95,
      bodyFatPercentage: 16,
      gender: 'male',
      sleepHours: 8,
      workoutDays: 3,
      consistencyScore: 85,
      reminderAdherence: 80,
      history: [
        { date: new Date('2026-06-15'), score: 80 },
        { date: new Date('2026-06-16'), score: 82 },
      ],
    };

    const results = engine.calculateScore(inputs);

    expect(results.score).toBeGreaterThanOrEqual(50);
    expect(results.score).toBeLessThanOrEqual(100);
    expect(results.breakdown.nutrition).toBe(93); // (95*0.5 + 90*0.5) = 92.5 rounded to 93
    expect(results.breakdown.sleep).toBe(100); // 8 hours is optimal (100)
    expect(results.history).toHaveLength(2);
    expect(results.history[0].date).toBe('2026-06-15');
  });
});
