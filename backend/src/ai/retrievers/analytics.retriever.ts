import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class AnalyticsRetriever {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async retrieve(userId: string) {
    try {
      const dashboard = await this.analyticsService.getDashboard(userId);
      const trends = await this.analyticsService.getTrends(userId);

      return {
        healthScore: dashboard.healthScore,
        consistencyScore: dashboard.consistencyScore,
        adherenceScore: dashboard.adherenceScore,
        currentStreak: dashboard.currentStreak,
        weightPrediction30Days: dashboard.weightPrediction,
        recommendations: dashboard.recommendations.map(r => `${r.title}: ${r.description}`),
        insights: dashboard.insights.map(i => `${i.title} - ${i.description}`),
        riskAlerts: dashboard.riskAlerts.map(a => `[Risk: ${a.type}] Level: ${a.riskLevel} - ${a.description}`),
        weightTrend: trends.weekly.map(w => `Date: ${w.date}, Weight: ${w.weight || 'N/A'}kg`).join(' | '),
      };
    } catch (e) {
      return {
        healthScore: 70,
        consistencyScore: 80,
        adherenceScore: 75,
        currentStreak: 0,
        weightPrediction30Days: 70,
        recommendations: [],
        insights: [],
        riskAlerts: [],
        weightTrend: '',
      };
    }
  }
}
export default AnalyticsRetriever;
