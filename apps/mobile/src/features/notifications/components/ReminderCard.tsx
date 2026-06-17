import React from 'react';
import { StyleSheet, View, Text, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { ReminderResponse } from '../../../../../../shared/contracts';

interface ReminderCardProps {
  reminder: ReminderResponse;
  onUpdate: (data: { id: string; enabled?: boolean; time?: string; days?: number[]; smart?: boolean }) => void;
}

const DAYS_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ReminderCard({ reminder, onUpdate }: ReminderCardProps) {
  const toggleDay = (dayIndex: number) => {
    let updatedDays = [...reminder.days];
    if (updatedDays.includes(dayIndex)) {
      updatedDays = updatedDays.filter(d => d !== dayIndex);
    } else {
      updatedDays.push(dayIndex);
      updatedDays.sort();
    }
    onUpdate({ id: reminder.type, days: updatedDays });
  };

  const toggleEnabled = (val: boolean) => {
    onUpdate({ id: reminder.type, enabled: val });
  };

  const toggleSmart = (val: boolean) => {
    onUpdate({ id: reminder.type, smart: val });
  };

  // Convert reminder type to user-friendly title
  const getTitle = (type: string) => {
    return type
      .replace('meal_', '')
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meal_breakfast':
      case 'meal_lunch':
      case 'meal_dinner':
        return 'restaurant-outline';
      case 'water':
        return 'water-outline';
      case 'exercise':
        return 'barbell-outline';
      case 'sleep':
        return 'bed-outline';
      case 'measurement':
        return 'scale-outline';
      case 'planner':
        return 'calendar-outline';
      case 'travel':
        return 'airplane-outline';
      case 'coach':
        return 'chatbubbles-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon(reminder.type)} size={20} color={colors.brand} />
          </View>
          <View>
            <Text style={styles.title}>{getTitle(reminder.type)}</Text>
            <Text style={styles.timeText}>{reminder.time}</Text>
          </View>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ false: colors.surfaceTertiary, true: colors.brand }}
          thumbColor={colors.onSurface}
        />
      </View>

      {reminder.enabled && (
        <View style={styles.body}>
          <View style={styles.daysRow}>
            {DAYS_NAMES.map((name, index) => {
              const active = reminder.days.includes(index);
              return (
                <Pressable
                  key={index}
                  onPress={() => toggleDay(index)}
                  style={[styles.dayButton, active && styles.dayButtonActive]}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>{name}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.smartRow}>
            <View style={styles.smartInfo}>
              <View style={styles.smartLabelRow}>
                <Ionicons name="sparkles" size={14} color={colors.brandSecondary} />
                <Text style={styles.smartLabel}>Smart Habit Scheduling</Text>
              </View>
              <Text style={styles.smartDesc}>
                Auto-schedules based on wake time, workouts, and travel mode instead of fixed times.
              </Text>
            </View>
            <Switch
              value={reminder.smart}
              onValueChange={toggleSmart}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandSecondary }}
              thumbColor={colors.onSurface}
            />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  timeText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  body: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    paddingTop: spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: colors.brand,
  },
  dayText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    fontWeight: '600',
  },
  dayTextActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  smartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  smartInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  smartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  smartLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginLeft: 4,
  },
  smartDesc: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    lineHeight: 14,
  },
});

export default ReminderCard;
