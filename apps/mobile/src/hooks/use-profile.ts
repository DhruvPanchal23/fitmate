import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { profileService } from '../services/profile-service';
import Toast from 'react-native-toast-message';
import {
  UpdateProfileRequest,
  CreateBodyMeasurementRequest,
} from '../../../../shared/contracts/profile';

export function useProfile() {
  const queryClient = useQueryClient();
  const [offlineProfile, setOfflineProfile] = useState<any>(null);

  // Load offline cached profile on mount
  useEffect(() => {
    async function loadCachedData() {
      try {
        const cached = await AsyncStorage.getItem('cached_profile');
        if (cached) {
          setOfflineProfile(JSON.parse(cached));
        }
      } catch (err) {
        console.error('Failed to load cached profile', err);
      }
    }
    loadCachedData();
  }, []);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isRefetching: isProfileRefetching,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await profileService.getProfile();
      if (data) {
        await AsyncStorage.setItem('cached_profile', JSON.stringify(data));
        setOfflineProfile(data);
      }
      return data;
    },
  });

  const { data: completion, refetch: refetchCompletion } = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: profileService.getCompletionScore,
  });

  const { data: healthScore, refetch: refetchHealth } = useQuery({
    queryKey: ['healthScore'],
    queryFn: profileService.getHealthScore,
    enabled: !!profile,
  });

  const { data: recommendations, refetch: refetchRecs } = useQuery({
    queryKey: ['goalRecommendations'],
    queryFn: profileService.getGoalRecommendations,
    enabled: !!profile,
  });

  const { data: bodyMeasurements, refetch: refetchMeasurements } = useQuery({
    queryKey: ['bodyMeasurements'],
    queryFn: profileService.getBodyMeasurements,
    enabled: !!profile,
  });

  const { data: weightProgress, refetch: refetchWeight } = useQuery({
    queryKey: ['weightProgress'],
    queryFn: profileService.getWeightProgress,
    enabled: !!profile,
  });

  const { data: bodyFatProgress, refetch: refetchBodyFat } = useQuery({
    queryKey: ['bodyFatProgress'],
    queryFn: profileService.getBodyFatProgress,
    enabled: !!profile,
  });

  const { data: measurementsProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['measurementsProgress'],
    queryFn: profileService.getMeasurementsProgress,
    enabled: !!profile,
  });

  const reloadAll = async () => {
    await Promise.all([
      refetchProfile(),
      refetchCompletion(),
      refetchHealth(),
      refetchRecs(),
      refetchMeasurements(),
      refetchWeight(),
      refetchBodyFat(),
      refetchProgress(),
    ]);
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: (data) => {
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Calorie and macro targets recalculated!',
      });
      AsyncStorage.setItem('cached_profile', JSON.stringify(data));
      setOfflineProfile(data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
      queryClient.invalidateQueries({ queryKey: ['healthScore'] });
      queryClient.invalidateQueries({ queryKey: ['goalRecommendations'] });
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || 'Could not update profile';
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: errMsg,
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: (data: Partial<UpdateProfileRequest>) => profileService.saveDraft(data),
    onSuccess: (data) => {
      AsyncStorage.setItem('cached_profile', JSON.stringify(data));
      setOfflineProfile(data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Draft Save Failed',
        text2: 'Could not autosave progress.',
      });
    },
  });

  const logMeasurementMutation = useMutation({
    mutationFn: (data: CreateBodyMeasurementRequest) => profileService.logBodyMeasurement(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Measurement Logged',
        text2: 'Progress stats updated!',
      });
      queryClient.invalidateQueries({ queryKey: ['bodyMeasurements'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['weightProgress'] });
      queryClient.invalidateQueries({ queryKey: ['bodyFatProgress'] });
      queryClient.invalidateQueries({ queryKey: ['measurementsProgress'] });
      queryClient.invalidateQueries({ queryKey: ['healthScore'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Log Failed',
        text2: 'Could not record measurement.',
      });
    },
  });

  const activeProfile = profile || offlineProfile;

  return {
    profile: activeProfile,
    isOffline: !profile && !!offlineProfile,
    completion,
    healthScore,
    recommendations,
    bodyMeasurements: bodyMeasurements || [],
    weightProgress,
    bodyFatProgress,
    measurementsProgress,
    loading: isProfileLoading,
    isRefetching: isProfileRefetching,
    reloadAll,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    saveDraft: saveDraftMutation.mutate,
    isSavingDraft: saveDraftMutation.isPending,
    logMeasurement: logMeasurementMutation.mutate,
    isLoggingMeasurement: logMeasurementMutation.isPending,
  };
}

export default useProfile;
