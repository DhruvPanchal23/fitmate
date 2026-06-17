import { apiClient } from './api-client';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  BodyMeasurementResponse,
  CreateBodyMeasurementRequest,
  ProfileCompletionResponse,
  ProgressTimeSeriesResponse,
  HealthScoreResponse,
  GoalRecommendationResponse,
} from '../../../../shared/contracts/profile';

export const profileService = {
  getProfile: async (): Promise<UserProfileResponse | null> => {
    return apiClient.get<UserProfileResponse | null>('/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    return apiClient.patch<UserProfileResponse>('/profile', data);
  },

  saveDraft: async (data: Partial<UpdateProfileRequest>): Promise<UserProfileResponse> => {
    return apiClient.post<UserProfileResponse>('/profile/draft', data);
  },

  getCompletionScore: async (): Promise<ProfileCompletionResponse> => {
    return apiClient.get<ProfileCompletionResponse>('/profile/completion');
  },

  getHealthScore: async (): Promise<HealthScoreResponse> => {
    return apiClient.get<HealthScoreResponse>('/profile/health-score');
  },

  getGoalRecommendations: async (): Promise<GoalRecommendationResponse> => {
    return apiClient.get<GoalRecommendationResponse>('/profile/recommendation');
  },

  logBodyMeasurement: async (data: CreateBodyMeasurementRequest): Promise<BodyMeasurementResponse> => {
    return apiClient.post<BodyMeasurementResponse>('/profile/body-measurement', data);
  },

  getBodyMeasurements: async (): Promise<BodyMeasurementResponse[]> => {
    return apiClient.get<BodyMeasurementResponse[]>('/profile/body-measurements');
  },

  getWeightProgress: async (): Promise<ProgressTimeSeriesResponse> => {
    return apiClient.get<ProgressTimeSeriesResponse>('/profile/progress/weight');
  },

  getBodyFatProgress: async (): Promise<ProgressTimeSeriesResponse> => {
    return apiClient.get<ProgressTimeSeriesResponse>('/profile/progress/body-fat');
  },

  getMeasurementsProgress: async (): Promise<Record<string, ProgressTimeSeriesResponse>> => {
    return apiClient.get<Record<string, ProgressTimeSeriesResponse>>('/profile/progress/measurements');
  },
};

export default profileService;
