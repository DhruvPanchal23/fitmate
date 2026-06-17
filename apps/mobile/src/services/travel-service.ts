import { apiClient } from './api-client';
import {
  StartTravelRequest,
  TravelSessionResponse,
  TravelAnalyticsResponse,
  CompensationPlanResponse,
} from '../../../../shared/contracts';

export const travelService = {
  toggleTravelMode: async (active: boolean): Promise<{ success: boolean; active: boolean }> => {
    return apiClient.post<{ success: boolean; active: boolean }>('/travel/toggle', { active });
  },

  getTravelStats: async () => {
    return apiClient.get<any>('/travel/stats');
  },

  startTravel: async (data: StartTravelRequest): Promise<TravelSessionResponse> => {
    return apiClient.post<TravelSessionResponse>('/travel/start', data);
  },

  endTravel: async (): Promise<{ session: TravelSessionResponse; plan: CompensationPlanResponse }> => {
    return apiClient.post<{ session: TravelSessionResponse; plan: CompensationPlanResponse }>('/travel/end');
  },

  getCurrentSession: async (): Promise<TravelSessionResponse | null> => {
    return apiClient.get<TravelSessionResponse | null>('/travel/current');
  },

  getHistory: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/travel/history');
  },

  getAnalytics: async (sessionId?: string): Promise<TravelAnalyticsResponse> => {
    const url = sessionId ? `/travel/analytics?sessionId=${sessionId}` : '/travel/analytics';
    return apiClient.get<TravelAnalyticsResponse>(url);
  },

  getRecoveryPlan: async (): Promise<any> => {
    return apiClient.get<any>('/travel/recovery');
  },

  updateRecoveryStatus: async (planId: string, status: string): Promise<any> => {
    return apiClient.post<any>('/travel/recovery/status', { planId, status });
  },
};

export default travelService;
