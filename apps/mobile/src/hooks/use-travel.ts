import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import travelService from '../services/travel-service';
import Toast from 'react-native-toast-message';
import { StartTravelRequest } from '../../../../shared/contracts';

export function useTravel(sessionId?: string) {
  const queryClient = useQueryClient();

  const {
    data: activeSession,
    isLoading: isActiveSessionLoading,
    isRefetching: isActiveSessionRefetching,
    refetch: refetchActiveSession,
  } = useQuery({
    queryKey: ['travelSession'],
    queryFn: travelService.getCurrentSession,
  });

  const {
    data: history,
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['travelHistory'],
    queryFn: travelService.getHistory,
  });

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['travelAnalytics', sessionId || activeSession?.id],
    queryFn: () => travelService.getAnalytics(sessionId || activeSession?.id),
    enabled: !!(sessionId || activeSession?.id),
  });

  const {
    data: recovery,
    isLoading: isRecoveryLoading,
    isRefetching: isRecoveryRefetching,
    refetch: refetchRecovery,
  } = useQuery({
    queryKey: ['travelRecovery'],
    queryFn: travelService.getRecoveryPlan,
  });

  const startTravelMutation = useMutation({
    mutationFn: (data: StartTravelRequest) => travelService.startTravel(data),
    onSuccess: (session) => {
      queryClient.setQueryData(['travelSession'], session);
      queryClient.invalidateQueries({ queryKey: ['travelSession'] });
      queryClient.invalidateQueries({ queryKey: ['travelHistory'] });
      Toast.show({
        type: 'success',
        text1: 'Travel Mode Enabled',
        text2: `Tracking details for your trip to ${session.destination || 'your destination'}.`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to start travel session',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    },
  });

  const endTravelMutation = useMutation({
    mutationFn: () => travelService.endTravel(),
    onSuccess: (data) => {
      queryClient.setQueryData(['travelSession'], null);
      queryClient.invalidateQueries({ queryKey: ['travelSession'] });
      queryClient.invalidateQueries({ queryKey: ['travelHistory'] });
      queryClient.invalidateQueries({ queryKey: ['travelRecovery'] });
      Toast.show({
        type: 'success',
        text1: 'Travel Mode Disabled',
        text2: `Session ended. Safe Recovery Plan generated.`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to end travel session',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (args: { planId: string; status: string }) =>
      travelService.updateRecoveryStatus(args.planId, args.status),
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({ queryKey: ['travelRecovery'] });
      Toast.show({
        type: 'success',
        text1: 'Recovery Status Updated',
        text2: `Marked recovery plan as ${args.status}.`,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update status',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    },
  });

  const refetchAll = async () => {
    await Promise.all([
      refetchActiveSession(),
      refetchHistory(),
      refetchAnalytics(),
      refetchRecovery(),
    ]);
  };

  return {
    activeSession,
    history,
    analytics,
    recovery,
    loading: isActiveSessionLoading || isHistoryLoading || isRecoveryLoading,
    isRefetching: isActiveSessionRefetching || isHistoryRefetching || isRecoveryRefetching,
    startTravel: startTravelMutation.mutateAsync,
    isStarting: startTravelMutation.isPending,
    endTravel: endTravelMutation.mutateAsync,
    isEnding: endTravelMutation.isPending,
    updateRecoveryStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    refetchAll,
  };
}

export default useTravel;
