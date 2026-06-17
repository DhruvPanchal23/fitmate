import { Injectable } from '@nestjs/common';
import { TrendDataPoint } from '../../../../shared/contracts/analytics';

@Injectable()
export class TrendEngine {
  processTrends(
    snapshots: {
      date: Date;
      weight: number | null;
      bodyFat: number | null;
      caloriesConsumed: number;
      caloriesTarget: number;
      steps: number;
    }[]
  ) {
    // Sort ascending by date
    const sorted = [...snapshots].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Weekly: last 7 snapshots or group by last 7 days
    const weeklyPoints: TrendDataPoint[] = sorted.slice(-7).map((s) => ({
      date: s.date.toISOString().split('T')[0],
      weight: s.weight || undefined,
      bodyFat: s.bodyFat || undefined,
      caloriesConsumed: s.caloriesConsumed,
      caloriesTarget: s.caloriesTarget,
      steps: s.steps,
    }));

    // Monthly: last 30 snapshots or group into 5-day intervals if large
    const monthlyPoints: TrendDataPoint[] = sorted.slice(-30).map((s) => ({
      date: s.date.toISOString().split('T')[0],
      weight: s.weight || undefined,
      bodyFat: s.bodyFat || undefined,
      caloriesConsumed: s.caloriesConsumed,
      caloriesTarget: s.caloriesTarget,
      steps: s.steps,
    }));

    return {
      weekly: weeklyPoints,
      monthly: monthlyPoints,
    };
  }
}
export default TrendEngine;
