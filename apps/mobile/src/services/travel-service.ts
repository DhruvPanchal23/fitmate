import { apiClient } from './api-client';

export const travelService = {
  toggleTravelMode: async (active: boolean): Promise<{ success: boolean; active: boolean }> => {
    await apiClient.post('/travel/toggle', { active });
    return { success: true, active };
  },

  getTravelStats: async () => {
    await apiClient.get('/travel/stats');
    return {
      streak: 5,
      activeDays: 24,
      waterTotal: 14.5,
      scannedMealsCount: 12,
    };
  },
};
