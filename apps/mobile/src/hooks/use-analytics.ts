import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import analyticsService from '../services/analytics-service';
import Toast from 'react-native-toast-message';

export function useAnalytics() {
  const queryClient = useQueryClient();

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isRefetching: isDashboardRefetching,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: analyticsService.getDashboard,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: trends,
    isLoading: isTrendsLoading,
    isRefetching: isTrendsRefetching,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['analyticsTrends'],
    queryFn: analyticsService.getTrends,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: streaks,
    isLoading: isStreaksLoading,
    isRefetching: isStreaksRefetching,
    refetch: refetchStreaks,
  } = useQuery({
    queryKey: ['analyticsStreaks'],
    queryFn: analyticsService.getStreaks,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: adherence,
    isLoading: isAdherenceLoading,
    isRefetching: isAdherenceRefetching,
    refetch: refetchAdherence,
  } = useQuery({
    queryKey: ['analyticsAdherence'],
    queryFn: analyticsService.getAdherence,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: healthScore,
    isLoading: isHealthScoreLoading,
    isRefetching: isHealthScoreRefetching,
    refetch: refetchHealthScore,
  } = useQuery({
    queryKey: ['analyticsHealthScore'],
    queryFn: analyticsService.getHealthScore,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: predictions,
    isLoading: isPredictionsLoading,
    isRefetching: isPredictionsRefetching,
    refetch: refetchPredictions,
  } = useQuery({
    queryKey: ['analyticsPredictions'],
    queryFn: analyticsService.getPredictions,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: recommendations,
    isLoading: isRecsLoading,
    isRefetching: isRecsRefetching,
    refetch: refetchRecs,
  } = useQuery({
    queryKey: ['analyticsRecommendations'],
    queryFn: analyticsService.getRecommendations,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: insights,
    isLoading: isInsightsLoading,
    isRefetching: isInsightsRefetching,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['analyticsInsights'],
    queryFn: analyticsService.getInsights,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const dismissInsightMutation = useMutation({
    mutationFn: (insightId: string) => analyticsService.dismissInsight(insightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsInsights'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] });
      Toast.show({
        type: 'success',
        text1: 'Insight Dismissed',
        text2: 'The alert has been successfully dismissed.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to dismiss',
        text2: 'Please try again.',
      });
    },
  });

  const refetchAll = async () => {
    await Promise.all([
      refetchDashboard(),
      refetchTrends(),
      refetchStreaks(),
      refetchAdherence(),
      refetchHealthScore(),
      refetchPredictions(),
      refetchRecs(),
      refetchInsights(),
    ]);
  };

  const loading =
    isDashboardLoading ||
    isTrendsLoading ||
    isStreaksLoading ||
    isAdherenceLoading ||
    isHealthScoreLoading ||
    isPredictionsLoading ||
    isRecsLoading ||
    isInsightsLoading;

  const isRefetching =
    isDashboardRefetching ||
    isTrendsRefetching ||
    isStreaksRefetching ||
    isAdherenceRefetching ||
    isHealthScoreRefetching ||
    isPredictionsRefetching ||
    isRecsRefetching ||
    isInsightsRefetching;

  return {
    dashboard,
    trends,
    streaks,
    adherence,
    healthScore,
    predictions,
    recommendations,
    insights,
    loading,
    isRefetching,
    dismissInsight: dismissInsightMutation.mutateAsync,
    isDismissing: dismissInsightMutation.isPending,
    reloadData: refetchAll,
  };
}

export default useAnalytics;
