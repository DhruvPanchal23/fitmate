import { apiClient } from './api-client';
import {
  TodayLogsResponse,
  MealResponse,
  CreateMealRequest,
  WaterLogResponse,
  SupplementLogResponse,
  FoodResponse,
} from '../../../../shared/contracts';

export const nutritionService = {
  getTodayLogs: async (): Promise<TodayLogsResponse> => {
    return apiClient.get<TodayLogsResponse>('/nutrition/today');
  },

  getRecentMeals: async (): Promise<MealResponse[]> => {
    return apiClient.get<MealResponse[]>('/nutrition/meals');
  },

  createMeal: async (data: CreateMealRequest): Promise<MealResponse> => {
    return apiClient.post<MealResponse>('/nutrition/meal', data);
  },

  deleteMeal: async (id: string): Promise<any> => {
    return apiClient.delete<any>(`/nutrition/meal/${id}`);
  },

  logWater: async (amountMl: number): Promise<WaterLogResponse> => {
    return apiClient.post<WaterLogResponse>('/nutrition/water', { amount: amountMl, unit: 'ml' });
  },

  logWorkout: async (burnKcal: number): Promise<any> => {
    return apiClient.post<any>('/nutrition/log-workout', { burnKcal });
  },

  logSupplement: async (name: string, dosage: number, unit: string): Promise<SupplementLogResponse> => {
    return apiClient.post<SupplementLogResponse>('/nutrition/supplement', { name, dosage, unit });
  },

  getSupplements: async (): Promise<SupplementLogResponse[]> => {
    return apiClient.get<SupplementLogResponse[]>('/nutrition/supplement');
  },

  searchFoods: async (query: string): Promise<FoodResponse[]> => {
    return apiClient.get<FoodResponse[]>(`/nutrition/foods/search?query=${encodeURIComponent(query)}`);
  }
};
export default nutritionService;
