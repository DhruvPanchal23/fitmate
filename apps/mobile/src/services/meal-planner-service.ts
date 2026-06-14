import { apiClient } from './api-client';
import {
  MealPlanResponse,
  GenerateMealPlanRequest,
  ReplaceMealRequest,
  ReplaceIngredientRequest,
  RegenerateMealRequest,
  SaveTemplateRequest,
  TemplateResponse,
  ShoppingListResponse,
  PantryItemResponse,
  PlannerInteractionRequest,
  PlannerInteractionResponse,
} from '../../../../shared/contracts';

export const mealPlannerService = {
  generatePlan: async (data: GenerateMealPlanRequest): Promise<MealPlanResponse> => {
    return apiClient.post<MealPlanResponse>('/meal-planner/generate', data);
  },

  getPlans: async (): Promise<MealPlanResponse[]> => {
    return apiClient.get<MealPlanResponse[]>('/meal-planner');
  },

  getPlan: async (id: string): Promise<MealPlanResponse> => {
    return apiClient.get<MealPlanResponse>(`/meal-planner/${id}`);
  },

  updatePlanTitle: async (id: string, title: string): Promise<MealPlanResponse> => {
    return apiClient.patch<MealPlanResponse>(`/meal-planner/${id}`, { title });
  },

  deletePlan: async (id: string): Promise<any> => {
    return apiClient.delete<any>(`/meal-planner/${id}`);
  },

  activatePlan: async (planId: string): Promise<any> => {
    return apiClient.post<any>('/meal-planner/activate', { planId });
  },

  regenerate: async (data: RegenerateMealRequest): Promise<MealPlanResponse> => {
    return apiClient.post<MealPlanResponse>('/meal-planner/regenerate', data);
  },

  replaceMeal: async (data: ReplaceMealRequest): Promise<MealPlanResponse> => {
    return apiClient.post<MealPlanResponse>('/meal-planner/replace', data);
  },

  replaceIngredient: async (data: ReplaceIngredientRequest): Promise<MealPlanResponse> => {
    return apiClient.post<MealPlanResponse>('/meal-planner/replace-ingredient', data);
  },

  getTemplates: async (): Promise<TemplateResponse[]> => {
    return apiClient.get<TemplateResponse[]>('/meal-planner/templates');
  },

  saveTemplate: async (data: SaveTemplateRequest): Promise<TemplateResponse> => {
    return apiClient.post<TemplateResponse>('/meal-planner/template/save', data);
  },

  deleteTemplate: async (id: string): Promise<any> => {
    return apiClient.delete<any>(`/meal-planner/template/${id}`);
  },

  getShoppingList: async (planId: string): Promise<ShoppingListResponse> => {
    return apiClient.get<ShoppingListResponse>(`/meal-planner/shopping-list/${planId}`);
  },

  completeMeal: async (mealId: string): Promise<any> => {
    return apiClient.post<any>(`/meal-planner/meal/${mealId}/complete`);
  },

  skipMeal: async (mealId: string): Promise<any> => {
    return apiClient.post<any>(`/meal-planner/meal/${mealId}/skip`);
  },

  getAnalytics: async (): Promise<any> => {
    return apiClient.get<any>('/meal-planner/analytics');
  },

  logInteraction: async (data: PlannerInteractionRequest): Promise<PlannerInteractionResponse> => {
    return apiClient.post<PlannerInteractionResponse>('/meal-planner/interaction', data);
  },
};

export default mealPlannerService;
