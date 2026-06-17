import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { useTravel } from '../../../hooks/use-travel';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ScreenHeader } from '../../../components/ScreenHeader';

export default function RecoveryPlanScreen() {
  const { recovery, loading, isRefetching, refetchAll, updateRecoveryStatus } = useTravel();

  if (loading && !recovery) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading recovery plan...</Text>
      </SafeAreaView>
    );
  }

  if (!recovery) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Recovery Plan" subtitle="Safe calorie compensation" />
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.onSurfaceTertiary} />
          <Text style={styles.emptyTitle}>No Active Recovery Plan</Text>
          <Text style={styles.emptySubtitle}>
            When you enable Travel Mode and complete your trip, a personalized recovery plan will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { plan, schedule, currentDayNumber, percentage, todayTarget } = recovery;

  const handleCompletePlan = async () => {
    try {
      await updateRecoveryStatus({ planId: plan.id, status: 'completed' });
    } catch (e) {
      // toast shown in hook
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Recovery Plan"
        subtitle={`Day ${currentDayNumber} of ${plan.recoveryDays} (${percentage}% Complete)`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchAll}
            tintColor={colors.brand}
          />
        }
      >
        {/* PROGRESS CARD */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>Total Surplus Compensating</Text>
          <Text style={styles.surplusValue}>{plan.totalSurplusCalories} kcal</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressInfoText}>{plan.recoveryDays - currentDayNumber + 1} days remaining</Text>
            <Text style={styles.progressInfoText}>Daily reduction: -{plan.dailyReductionCalories} kcal</Text>
          </View>
        </Card>

        {/* TODAY TARGETS */}
        <Text style={styles.sectionTitle}>Today's Targets</Text>
        <Card style={styles.targetsCard}>
          <View style={styles.targetRow}>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Calorie Target</Text>
              <Text style={[styles.targetValue, styles.caloriesValue]}>
                {todayTarget.caloriesTarget} kcal
              </Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Protein Goal</Text>
              <Text style={[styles.targetValue, styles.proteinValue]}>
                {todayTarget.proteinTarget}g
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.targetRow}>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Carbs Target</Text>
              <Text style={styles.targetSubValue}>{todayTarget.carbsTarget}g</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Fats Target</Text>
              <Text style={styles.targetSubValue}>{todayTarget.fatsTarget}g</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Step Goal</Text>
              <Text style={styles.targetSubValue}>
                <Ionicons name="footsteps" size={14} color={colors.brand} />
                {' '}{todayTarget.recommendedSteps.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* ACTIVITIES CARD */}
        <Text style={styles.sectionTitle}>Recommended Activities</Text>
        <Card style={styles.activityCard}>
          {todayTarget.activities.map((activity: string, idx: number) => (
            <View key={idx} style={styles.activityItemRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.brand} />
              <Text style={styles.activityItemText}>{activity}</Text>
            </View>
          ))}
          {todayTarget.recommendedStrengthSessions > 0 && (
            <View style={styles.activityItemRow}>
              <Ionicons name="barbell-outline" size={20} color={colors.warning} />
              <Text style={styles.activityItemText}>Perform a Strength Session</Text>
            </View>
          )}
          {todayTarget.recommendedCardioMinutes > 0 && (
            <View style={styles.activityItemRow}>
              <Ionicons name="heart-outline" size={20} color={colors.error} />
              <Text style={styles.activityItemText}>
                Perform {todayTarget.recommendedCardioMinutes} mins Cardio
              </Text>
            </View>
          )}
        </Card>

        {/* DAY BY DAY PLAN */}
        <Text style={styles.sectionTitle}>Full Recovery Schedule</Text>
        {schedule.map((day: any) => {
          const isCurrent = day.dayNumber === currentDayNumber;
          const isCompleted = day.dayNumber < currentDayNumber;
          return (
            <Card
              key={day.dayNumber}
              style={StyleSheet.flatten([
                styles.scheduleItemCard,
                isCurrent ? styles.scheduleItemCurrent : undefined,
                isCompleted ? styles.scheduleItemCompleted : undefined,
              ])}
            >
              <View style={styles.scheduleItemHeader}>
                <Text style={styles.scheduleDayNumber}>Day {day.dayNumber}</Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
                {isCurrent && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Today</Text>
                  </View>
                )}
              </View>
              <View style={styles.scheduleDetailRow}>
                <Text style={styles.scheduleDetailText}>
                  {day.caloriesTarget} kcal  •  {day.proteinTarget}g Protein  •  {day.recommendedSteps.toLocaleString()} steps
                </Text>
              </View>
            </Card>
          );
        })}

        {plan.status === 'active' && (
          <Button
            title="Complete Recovery Early"
            onPress={handleCompletePlan}
            variant="outline"
            style={styles.completeButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.onSurfaceSecondary,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase',
  },
  surplusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.warning,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressInfoText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 12,
  },
  targetsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetItem: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase',
  },
  targetValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  caloriesValue: {
    color: colors.onSurface,
  },
  proteinValue: {
    color: colors.brandSecondary,
  },
  targetSubValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  activityCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  activityItemText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginLeft: 10,
  },
  scheduleItemCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
  },
  scheduleItemCurrent: {
    borderColor: colors.brand,
    borderWidth: 1.5,
  },
  scheduleItemCompleted: {
    opacity: 0.6,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  completedBadge: {
    backgroundColor: colors.divider,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '600',
  },
  scheduleDetailRow: {
    marginTop: 4,
  },
  scheduleDetailText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  completeButton: {
    marginTop: 24,
    borderColor: colors.error,
  },
});
