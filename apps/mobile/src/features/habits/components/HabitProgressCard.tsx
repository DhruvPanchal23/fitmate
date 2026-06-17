import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { HabitAnalyticsResponse } from '../../../../../../shared/contracts';

interface HabitProgressCardProps {
  analytics: HabitAnalyticsResponse;
}

export function HabitProgressCard({ analytics }: HabitProgressCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.header}>Habit consistency</Text>

      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Weekly Score</Text>
          <Text style={[styles.scoreVal, { color: colors.brand }]}>{analytics.weeklyScore}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Monthly Score</Text>
          <Text style={[styles.scoreVal, { color: colors.brandSecondary }]}>{analytics.monthlyScore}</Text>
        </View>
      </View>

      {analytics.insights && analytics.insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.insightsHeader}>AI Habit Insights</Text>
          {analytics.insights.map((insight: string, idx: number) => (
            <View key={idx} style={styles.insightRow}>
              <Ionicons name="bulb-outline" size={16} color={colors.brandSecondary} style={styles.bulbIcon} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginBottom: 4,
  },
  scoreVal: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceSecondary,
  },
  insightsSection: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  insightsHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulbIcon: {
    marginTop: 1,
    marginRight: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    lineHeight: 16,
  },
});

export default HabitProgressCard;
