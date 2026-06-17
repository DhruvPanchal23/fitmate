import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { NotificationResponse } from '../../../../../../shared/contracts';

interface NotificationCardProps {
  notification: NotificationResponse;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'meal_breakfast':
      case 'meal_lunch':
      case 'meal_dinner':
      case 'meal':
        return 'restaurant';
      case 'water':
        return 'water';
      case 'exercise':
        return 'barbell';
      case 'sleep':
        return 'bed';
      case 'measurement':
        return 'scale';
      case 'planner':
        return 'calendar';
      case 'travel':
        return 'airplane';
      case 'coach':
        return 'chatbubbles';
      default:
        return 'notifications';
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Pressable onPress={() => !notification.read && onMarkRead(notification.id)}>
      <Card style={StyleSheet.flatten([styles.card, !notification.read && styles.unreadCard])}>
        <View style={styles.contentRow}>
          <View style={[styles.iconContainer, !notification.read && styles.unreadIconContainer]}>
            <Ionicons
              name={getIcon(notification.type)}
              size={18}
              color={!notification.read ? colors.brand : colors.onSurfaceSecondary}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !notification.read && styles.unreadTitle]}>{notification.title}</Text>
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.body}>{notification.body}</Text>
            <Text style={styles.time}>{getRelativeTime(notification.createdAt)}</Text>
          </View>
          <Pressable onPress={() => onDelete(notification.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  unreadIconContainer: {
    backgroundColor: colors.surfaceSecondary,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    fontWeight: '500',
  },
  unreadTitle: {
    color: colors.onSurface,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    marginLeft: 6,
  },
  body: {
    fontSize: 13,
    color: colors.onSurface,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default NotificationCard;
