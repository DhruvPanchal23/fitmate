import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { HabitResponse } from '../../../../../../shared/contracts';

interface HabitCardProps {
  habit: HabitResponse;
}

export function HabitCard({ habit }: HabitCardProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'water':
        return 'water-outline';
      case 'meal_logging':
        return 'restaurant-outline';
      case 'workout':
        return 'barbell-outline';
      case 'planner':
        return 'calendar-outline';
      case 'sleep':
        return 'bed-outline';
      case 'ai_coach':
        return 'chatbubbles-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const getTitle = (name: string) => {
    return name
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const completionPercent = Math.round(habit.completionRate * 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon(habit.name)} size={20} color={colors.brand} />
          </View>
          <View>
            <Text style={styles.title}>{getTitle(habit.name)}</Text>
            <Text style={styles.targetText}>Target: {habit.targetFrequency} days / week</Text>
          </View>
        </View>

        {habit.streak > 0 && (
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color={colors.warning} />
            <Text style={styles.streakText}>{habit.streak}d streak</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>Weekly Completion</Text>
          <Text style={styles.progressVal}>{completionPercent}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(completionPercent, 100)}%` }]} />
        </View>
      </View>
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
  targetText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 4,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  progressVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.brand,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceSecondary,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
});

export default HabitCard;
