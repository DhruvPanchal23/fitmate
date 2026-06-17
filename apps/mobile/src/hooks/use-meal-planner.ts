import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealPlannerService } from '../services/meal-planner-service';
import Toast from 'react-native-toast-message';
import {
  GenerateMealPlanRequest,
  RegenerateMealRequest,
  ReplaceMealRequest,
  SaveTemplateRequest,
} from '../../../../shared/contracts';

export function useMealPlanner() {
  const queryClient = useQueryClient();

  const {
    data: plans,
    isLoading: isPlansLoading,
    isRefetching: isPlansRefetching,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: mealPlannerService.getPlans,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    isRefetching: isAnalyticsRefetching,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['plannerAnalytics'],
    queryFn: mealPlannerService.getAnalytics,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const loading = isPlansLoading || isAnalyticsLoading;
  const isRefetching = isPlansRefetching || isAnalyticsRefetching;

  const refetchAll = async () => {
    await Promise.all([refetchPlans(), refetchAnalytics()]);
  };

  const generatePlanMutation = useMutation({
    mutationFn: (data: GenerateMealPlanRequest) => mealPlannerService.generatePlan(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Plan Generated',
        text2: 'Your meal plan has been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to generate plan',
        text2: 'Please try again.',
      });
    },
  });

  const activatePlanMutation = useMutation({
    mutationFn: (planId: string) => mealPlannerService.activatePlan(planId),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Plan Activated',
        text2: 'Your meal plan is now active.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to activate plan',
        text2: 'Please try again.',
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => mealPlannerService.deletePlan(id),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Plan Deleted',
        text2: 'Your meal plan has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete plan',
        text2: 'Please try again.',
      });
    },
  });

  const completeMealMutation = useMutation({
    mutationFn: (mealId: string) => mealPlannerService.completeMeal(mealId),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Meal Completed',
        text2: 'Meal has been logged as completed.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['todayLogs'] });
      queryClient.invalidateQueries({ queryKey: ['todayMeals'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to complete meal',
        text2: 'Please try again.',
      });
    },
  });

  const skipMealMutation = useMutation({
    mutationFn: (mealId: string) => mealPlannerService.skipMeal(mealId),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Meal Skipped',
        text2: 'Meal has been marked as skipped.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to skip meal',
        text2: 'Please try again.',
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (data: RegenerateMealRequest) => mealPlannerService.regenerate(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Plan Updated',
        text2: 'Your meal plan has been regenerated.',
      });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to regenerate plan',
        text2: 'Please try again.',
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: (data: SaveTemplateRequest) => mealPlannerService.saveTemplate(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Template Saved',
        text2: 'Your meal plan template has been saved.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to save template',
        text2: 'Please try again.',
      });
    },
  });

  const activePlan = (plans || []).find((p) => p.status === 'active') || null;

  return {
    allPlans: plans || [],
    activePlan,
    analytics,
    loading,
    isRefetching,
    generatePlan: generatePlanMutation,
    activatePlan: activatePlanMutation,
    deletePlan: deletePlanMutation,
    completeMeal: completeMealMutation,
    skipMeal: skipMealMutation,
    regenerate: regenerateMutation,
    saveTemplate: saveTemplateMutation,
    reloadData: refetchAll,
  };
}
export default useMealPlanner;
