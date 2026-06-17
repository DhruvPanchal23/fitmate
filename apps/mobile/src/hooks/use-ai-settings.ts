import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import aiService from '../services/ai-service';
import Toast from 'react-native-toast-message';
import { AIProviderConfig, AIMemoryItem, AITokenUsageStats, AICostStats, AICacheStats } from '../../../../shared/contracts';

export function useAISettings() {
  const queryClient = useQueryClient();

  // 1. Queries
  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    refetch: refetchProviders,
  } = useQuery<AIProviderConfig[]>({
    queryKey: ['aiProviders'],
    queryFn: aiService.getProviders,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: memories = [],
    isLoading: isMemoriesLoading,
    refetch: refetchMemories,
  } = useQuery<AIMemoryItem[]>({
    queryKey: ['aiMemories'],
    queryFn: aiService.getMemories,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: tokenUsage,
    isLoading: isTokenUsageLoading,
    refetch: refetchTokenUsage,
  } = useQuery<AITokenUsageStats>({
    queryKey: ['aiTokenUsage'],
    queryFn: aiService.getTokenUsage,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: cost,
    isLoading: isCostLoading,
    refetch: refetchCost,
  } = useQuery<AICostStats>({
    queryKey: ['aiCost'],
    queryFn: aiService.getCost,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: cacheStats,
    isLoading: isCacheStatsLoading,
    refetch: refetchCacheStats,
  } = useQuery<AICacheStats>({
    queryKey: ['aiCacheStats'],
    queryFn: aiService.getCacheStats,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: health = [],
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useQuery<any[]>({
    queryKey: ['aiHealth'],
    queryFn: aiService.getHealth,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: prompts = [],
    isLoading: isPromptsLoading,
    refetch: refetchPrompts,
  } = useQuery<any[]>({
    queryKey: ['aiPrompts'],
    queryFn: aiService.getPrompts,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const refetchAll = async () => {
    await Promise.all([
      refetchProviders(),
      refetchMemories(),
      refetchTokenUsage(),
      refetchCost(),
      refetchCacheStats(),
      refetchHealth(),
      refetchPrompts(),
    ]);
  };

  // 2. Mutations
  const setActiveProviderMutation = useMutation({
    mutationFn: (provider: string) => aiService.setActiveProvider(provider),
    onSuccess: (_, provider) => {
      Toast.show({
        type: 'success',
        text1: 'Provider Updated',
        text2: `Successfully switched to ${provider.toUpperCase()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['aiProviders'] });
      queryClient.invalidateQueries({ queryKey: ['aiHealth'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Switch Failed',
        text2: err.message || 'Could not update AI provider',
      });
    },
  });

  const updateMemoryStatusMutation = useMutation({
    mutationFn: ({ id, isPinned, isIgnored }: { id: string; isPinned?: boolean; isIgnored?: boolean }) =>
      aiService.updateMemoryStatus(id, { isPinned, isIgnored }),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Memory Updated',
        text2: 'Memory item preferences updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['aiMemories'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err.message,
      });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id?: string) => aiService.deleteMemory(id),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Memory Deleted',
        text2: 'Facts have been purged successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['aiMemories'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Purge Failed',
        text2: err.message,
      });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: () => aiService.clearCache(),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Cache Cleared',
        text2: 'Semantic prompt cache successfully cleared.',
      });
      queryClient.invalidateQueries({ queryKey: ['aiCacheStats'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Clear Failed',
        text2: err.message,
      });
    },
  });

  return {
    providers,
    memories,
    tokenUsage,
    cost,
    cacheStats,
    health,
    prompts,
    isLoading:
      isProvidersLoading ||
      isMemoriesLoading ||
      isTokenUsageLoading ||
      isCostLoading ||
      isCacheStatsLoading ||
      isHealthLoading ||
      isPromptsLoading,
    refetchAll,
    setActiveProvider: setActiveProviderMutation.mutate,
    updateMemoryStatus: updateMemoryStatusMutation.mutate,
    deleteMemory: deleteMemoryMutation.mutate,
    clearCache: clearCacheMutation.mutate,
  };
}
export default useAISettings;
