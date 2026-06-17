import { apiClient } from './api-client';
import {
  AnalyticsDashboardResponse,
  AnalyticsTrendsResponse,
  AnalyticsStreaksResponse,
  AnalyticsAdherenceResponse,
  AnalyticsHealthScoreResponse,
  AnalyticsPredictionsResponse,
  RecommendationResponse,
  InsightResponse,
} from '../../../../shared/contracts';

export const analyticsService = {
  getDashboard: async (): Promise<AnalyticsDashboardResponse> => {
    return apiClient.get<AnalyticsDashboardResponse>('/analytics/dashboard');
  },

  getTrends: async (): Promise<AnalyticsTrendsResponse> => {
    return apiClient.get<AnalyticsTrendsResponse>('/analytics/trends');
  },

  getStreaks: async (): Promise<AnalyticsStreaksResponse> => {
    return apiClient.get<AnalyticsStreaksResponse>('/analytics/streaks');
  },

  getAdherence: async (): Promise<AnalyticsAdherenceResponse> => {
    return apiClient.get<AnalyticsAdherenceResponse>('/analytics/adherence');
  },

  getHealthScore: async (): Promise<AnalyticsHealthScoreResponse> => {
    return apiClient.get<AnalyticsHealthScoreResponse>('/analytics/health-score');
  },

  getPredictions: async (): Promise<AnalyticsPredictionsResponse> => {
    return apiClient.get<AnalyticsPredictionsResponse>('/analytics/predictions');
  },

  getRecommendations: async (): Promise<RecommendationResponse[]> => {
    return apiClient.get<RecommendationResponse[]>('/analytics/recommendations');
  },

  getInsights: async (): Promise<InsightResponse[]> => {
    return apiClient.get<InsightResponse[]>('/analytics/insights');
  },

  dismissInsight: async (insightId: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/analytics/insight/${insightId}/dismiss`);
  },
};

export default analyticsService;
