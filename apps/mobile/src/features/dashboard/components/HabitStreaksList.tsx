import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface HabitItem {
  id: string;
  name: string;
  streak: number;
}

interface HabitStreaksListProps {
  habits: HabitItem[];
  onViewAllPress: () => void;
}

export const HabitStreaksList = React.memo(({ habits, onViewAllPress }: HabitStreaksListProps) => {
  if (!habits || habits.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerWithAction}>
        <Text style={styles.sectionTitle}>Habit Streaks</Text>
        <Pressable onPress={onViewAllPress}>
          <Text style={styles.seeAllText}>View All</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.habitsScroll}>
        {habits.map((habit) => (
          <Card
            key={habit.id}
            variant="solid"
            style={styles.habitDashboardCard}
            onPress={onViewAllPress}
          >
            <Ionicons
              name={
                habit.name === 'water'
                  ? 'water'
                  : habit.name === 'meal_logging'
                  ? 'restaurant'
                  : habit.name === 'workout'
                  ? 'barbell'
                  : habit.name === 'sleep'
                  ? 'bed'
                  : 'checkmark-circle'
              }
              size={18}
              color={colors.brand}
            />
            <Text style={styles.habitDashboardName}>
              {habit.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            <View style={styles.habitDashboardStreakRow}>
              <Ionicons name="flame" size={14} color={habit.streak > 0 ? colors.warning : colors.onSurfaceSecondary} />
              <Text style={[styles.habitDashboardStreak, habit.streak > 0 && { color: colors.warning }]}>
                {habit.streak}d
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
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
  habitsScroll: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  habitDashboardCard: {
    width: 130,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: 0,
  },
  habitDashboardName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  habitDashboardStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  habitDashboardStreak: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
  },
});

export default HabitStreaksList;
