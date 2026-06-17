import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useNotifications } from '../../../hooks/use-notifications';
import { NotificationCard } from '../components/NotificationCard';
import { Button } from '../../../components/Button';
import { ScreenHeader } from '../../../components/ScreenHeader';

export function NotificationCenterScreen() {
  const {
    notifications,
    loading,
    isRefetching,
    markAsRead,
    deleteNotification,
    reloadData,
  } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAsRead();
  };

  const handleMarkOneRead = async (id: string) => {
    await markAsRead([id]);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread updates` : 'All caught up!'}
      />

      {unreadCount > 0 && (
        <View style={styles.actionHeader}>
          <Button
            title="Mark all as read"
            onPress={handleMarkAllRead}
            variant="outline"
            size="sm"
            fullWidth={false}
          />
        </View>
      )}

      <FlatList
        data={notifications || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkRead={handleMarkOneRead}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reloadData}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.onSurfaceSecondary} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>We will let you know when you have reminders or coach updates.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  actionHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default NotificationCenterScreen;
