import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

interface TodayRemindersListProps {
  notifications: NotificationItem[];
  onManagePress: () => void;
}

export const TodayRemindersList = React.memo(({ notifications, onManagePress }: TodayRemindersListProps) => {
  const unreadNotifs = notifications ? notifications.filter(n => !n.read) : [];
  if (unreadNotifs.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerWithAction}>
        <Text style={styles.sectionTitle}>Today's Reminders</Text>
        <Pressable onPress={onManagePress}>
          <Text style={styles.seeAllText}>Manage</Text>
        </Pressable>
      </View>
      {unreadNotifs.slice(0, 2).map((notif) => (
        <Card
          key={notif.id}
          variant="solid"
          style={styles.notifDashboardCard}
          onPress={onManagePress}
        >
          <View style={styles.notifDashboardHeader}>
            <Ionicons name="notifications-circle" size={20} color={colors.brandSecondary} />
            <Text style={styles.notifDashboardTitle}>{notif.title}</Text>
          </View>
          <Text style={styles.notifDashboardBody}>{notif.body}</Text>
        </Card>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  headerWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
  },
  notifDashboardCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  notifDashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
    gap: spacing.xs,
  },
  notifDashboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  notifDashboardBody: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    lineHeight: 16,
  },
});

export default TodayRemindersList;
