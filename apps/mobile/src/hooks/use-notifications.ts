import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationsService from '../services/notifications-service';
import Toast from 'react-native-toast-message';
import { UpdateReminderRequest } from '../../../../shared/contracts';

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    isRefetching: isNotificationsRefetching,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
  });

  const {
    data: reminders,
    isLoading: isRemindersLoading,
    isRefetching: isRemindersRefetching,
    refetch: refetchReminders,
  } = useQuery({
    queryKey: ['reminders'],
    queryFn: notificationsService.getReminders,
  });

  const {
    data: habits,
    isLoading: isHabitsLoading,
    isRefetching: isHabitsRefetching,
    refetch: refetchHabits,
  } = useQuery({
    queryKey: ['habits'],
    queryFn: notificationsService.getHabits,
  });

  const {
    data: habitStreaks,
    isLoading: isHabitStreaksLoading,
    isRefetching: isHabitStreaksRefetching,
    refetch: refetchHabitStreaks,
  } = useQuery({
    queryKey: ['habitStreaks'],
    queryFn: notificationsService.getHabitStreaks,
  });

  const {
    data: habitAnalytics,
    isLoading: isHabitAnalyticsLoading,
    isRefetching: isHabitAnalyticsRefetching,
    refetch: refetchHabitAnalytics,
  } = useQuery({
    queryKey: ['habitAnalytics'],
    queryFn: notificationsService.getHabitAnalytics,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (ids?: string[]) => notificationsService.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Toast.show({
        type: 'success',
        text1: 'Notifications Read',
        text2: 'Marked all as read.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update',
        text2: 'Please try again.',
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Toast.show({
        type: 'success',
        text1: 'Notification Deleted',
        text2: 'The notification has been removed.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete',
        text2: 'Please try again.',
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: (data: UpdateReminderRequest) => notificationsService.updateReminder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Toast.show({
        type: 'success',
        text1: 'Reminder Saved',
        text2: 'Your schedule has been successfully updated.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update',
        text2: 'Please try again.',
      });
    },
  });

  const refetchAll = async () => {
    await Promise.all([
      refetchNotifications(),
      refetchReminders(),
      refetchHabits(),
      refetchHabitStreaks(),
      refetchHabitAnalytics(),
    ]);
  };

  const loading =
    isNotificationsLoading ||
    isRemindersLoading ||
    isHabitsLoading ||
    isHabitStreaksLoading ||
    isHabitAnalyticsLoading;

  const isRefetching =
    isNotificationsRefetching ||
    isRemindersRefetching ||
    isHabitsRefetching ||
    isHabitStreaksRefetching ||
    isHabitAnalyticsRefetching;

  return {
    notifications,
    reminders,
    habits,
    habitStreaks,
    habitAnalytics,
    loading,
    isRefetching,
    markAsRead: (ids?: string[]) => markAsReadMutation.mutateAsync(ids),
    deleteNotification: deleteNotificationMutation.mutateAsync,
    updateReminder: updateReminderMutation.mutateAsync,
    reloadData: refetchAll,
  };
}

export default useNotifications;
