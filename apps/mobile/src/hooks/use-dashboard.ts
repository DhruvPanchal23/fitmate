import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { nutritionService } from '../services/nutrition-service';
import { colors } from '../theme/colors';
import Toast from 'react-native-toast-message';

export function useDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: logs,
    isLoading: isLogsLoading,
    isRefetching: isLogsRefetching,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['todayLogs'],
    queryFn: nutritionService.getTodayLogs,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const {
    data: mealsData,
    isLoading: isMealsLoading,
    isRefetching: isMealsRefetching,
    refetch: refetchMeals,
  } = useQuery({
    queryKey: ['todayMeals'],
    queryFn: nutritionService.getRecentMeals,
    staleTime: 300000,
    gcTime: 900000,
    retry: 2,
  });

  const loading = isLogsLoading || isMealsLoading;
  const isRefetching = isLogsRefetching || isMealsRefetching;

  const meals = mealsData || [];
  const water = logs?.water || { current: 0, target: 2500 };
  const calories = logs?.calories || { current: 0, target: 2200 };
  const protein = logs?.protein || { current: 0, target: 150 };
  const carbs = logs?.carbs || { current: 0, target: 200 };
  const fat = logs?.fat || { current: 0, target: 70 };

  const refetchAll = async () => {
    await Promise.all([refetchLogs(), refetchMeals()]);
  };

  const logWaterMutation = useMutation({
    mutationFn: (amountMl: number) => nutritionService.logWater(amountMl),
    onMutate: async (amountMl) => {
      await queryClient.cancelQueries({ queryKey: ['todayLogs'] });
      const previousLogs = queryClient.getQueryData<any>(['todayLogs']);

      if (previousLogs) {
        queryClient.setQueryData(['todayLogs'], {
          ...previousLogs,
          water: {
            ...previousLogs.water,
            current: previousLogs.water.current + amountMl,
          },
        });
      }

      return { previousLogs };
    },
    onError: (err, amountMl, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(['todayLogs'], context.previousLogs);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to log water',
        text2: 'Please try again.',
      });
    },
    onSuccess: (data, amountMl) => {
      Toast.show({
        type: 'success',
        text1: 'Water Logged',
        text2: `Successfully logged ${amountMl}ml.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayLogs'] });
    },
  });

  const logWorkoutMutation = useMutation({
    mutationFn: (burnKcal: number) => nutritionService.logWorkout(burnKcal),
    onMutate: async (burnKcal) => {
      await queryClient.cancelQueries({ queryKey: ['todayLogs'] });
      const previousLogs = queryClient.getQueryData<any>(['todayLogs']);

      if (previousLogs) {
        queryClient.setQueryData(['todayLogs'], {
          ...previousLogs,
          calories: {
            ...previousLogs.calories,
            target: previousLogs.calories.target + burnKcal,
          },
        });
      }

      return { previousLogs };
    },
    onError: (err, burnKcal, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(['todayLogs'], context.previousLogs);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to log workout',
        text2: 'Please try again.',
      });
    },
    onSuccess: (data, burnKcal) => {
      Toast.show({
        type: 'info',
        text1: 'Workout Logged',
        text2: `Added workout. +${burnKcal} kcal target added.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayLogs'] });
    },
  });

  const logSupplementMutation = useMutation({
    mutationFn: (args: { name: string; dosage: number; unit: string }) =>
      nutritionService.logSupplement(args.name, args.dosage, args.unit),
    onSuccess: (data, args) => {
      Toast.show({
        type: 'success',
        text1: 'Supplement Logged',
        text2: `Successfully logged ${args.name} (${args.dosage}${args.unit}).`,
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to log supplement',
        text2: 'Please try again.',
      });
    },
  });

  const handleQuickAction = async (id: string) => {
    switch (id) {
      case 'scan':
        router.push('/scan' as any);
        break;
      case 'water':
        logWaterMutation.mutate(250);
        break;
      case 'workout':
        logWorkoutMutation.mutate(300);
        break;
      case 'supps':
        logSupplementMutation.mutate({
          name: 'Creatine Monohydrate',
          dosage: 5,
          unit: 'g',
        });
        break;
      default:
        break;
    }
  };

  const QUICK_ACTIONS = [
    { id: 'scan', label: 'Scan Meal', icon: 'camera', color: colors.brand },
    { id: 'water', label: 'Log Water', icon: 'water', color: colors.brandSecondary },
    { id: 'workout', label: 'Workout', icon: 'barbell', color: colors.warning },
    { id: 'supps', label: 'Supplements', icon: 'leaf', color: colors.success },
  ] as const;

  return {
    meals,
    water,
    calories,
    protein,
    carbs,
    fat,
    loading,
    isRefetching,
    handleQuickAction,
    QUICK_ACTIONS,
    reloadData: refetchAll,
  };
}
export default useDashboard;
