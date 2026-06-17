import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { useDashboard } from '../../../hooks/use-dashboard';
import { useTravel } from '../../../hooks/use-travel';
import { useAnalytics } from '../../../hooks/use-analytics';
import { useNotifications } from '../../../hooks/use-notifications';
import { SkeletonDashboard } from '../../../components/LoadingState';
import Toast from 'react-native-toast-message';

// Subcomponents
import RiskAlertsBanner from './RiskAlertsBanner';
import MacroProgressCard from './MacroProgressCard';
import QuickActionsGrid from './QuickActionsGrid';
import AIRecommendationsList from './AIRecommendationsList';
import HabitStreaksList from './HabitStreaksList';
import TodayRemindersList from './TodayRemindersList';
import LoggedMealsList from './LoggedMealsList';

export function DashboardContainer() {
  const {
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
    reloadData,
  } = useDashboard();

  const router = useRouter();
  const { recovery } = useTravel();
  const { dashboard } = useAnalytics();
  const { notifications, habits } = useNotifications();

  const handleAction = useCallback((id: string) => {
    handleQuickAction(id);
  }, [handleQuickAction]);

  const navigateToHabits = useCallback(() => {
    router.push('/habits' as any);
  }, [router]);

  const navigateToNotifications = useCallback(() => {
    router.push('/notifications' as any);
  }, [router]);

  const handleAddFoodPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Custom Logging',
      text2: 'Use Scanner or AI Coach for quick logging.',
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Hello, Dhruv"
        subtitle="Make today a healthy day!"
        showAvatar
      />
      
      {loading ? (
        <SkeletonDashboard />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={reloadData}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        >
          {/* Risk Alerts Notice Banners */}
          {dashboard && dashboard.riskAlerts && (
            <RiskAlertsBanner alerts={dashboard.riskAlerts} />
          )}

          {/* Macro Progress Ring Card */}
          <MacroProgressCard
            calories={calories}
            protein={protein}
            carbs={carbs}
            fat={fat}
            water={water}
          />

          {/* Intelligence Score Overview Row */}
          {dashboard && (
            <View style={styles.dashboardScoresRow}>
              <Card variant="solid" style={styles.scoreBadgeItem}>
                <Text style={styles.scoreBadgeNum}>{dashboard.healthScore}</Text>
                <Text style={styles.scoreBadgeLbl}>Health</Text>
              </Card>
              <Card variant="solid" style={styles.scoreBadgeItem}>
                <Text style={styles.scoreBadgeNum}>{dashboard.consistencyScore}%</Text>
                <Text style={styles.scoreBadgeLbl}>Consistency</Text>
              </Card>
              <Card variant="solid" style={styles.scoreBadgeItem}>
                <Text style={styles.scoreBadgeNum}>{dashboard.adherenceScore}%</Text>
                <Text style={styles.scoreBadgeLbl}>Adherence</Text>
              </Card>
            </View>
          )}

          {/* Quick Metrics (Streak and Forecast) */}
          {dashboard && (
            <Card variant="solid" style={styles.quickMetricsCard}>
              <View style={styles.quickMetricsRow}>
                <View style={styles.quickMetricBox}>
                  <Ionicons name="flame" size={18} color={colors.warning} />
                  <Text style={styles.quickMetricVal}> {dashboard.currentStreak} Days</Text>
                  <Text style={styles.quickMetricLbl}>Streak</Text>
                </View>
                <View style={styles.quickMetricDivider} />
                <View style={styles.quickMetricBox}>
                  <Ionicons name="trending-down" size={18} color={colors.brandSecondary} />
                  <Text style={styles.quickMetricVal}> {dashboard.weightPrediction} kg</Text>
                  <Text style={styles.quickMetricLbl}>Weight (30d)</Text>
                </View>
              </View>
            </Card>
          )}

          {/* AI Recommendations */}
          {dashboard && dashboard.recommendations && (
            <AIRecommendationsList recommendations={dashboard.recommendations} />
          )}

          {/* Habit Streaks widget */}
          {habits && (
            <HabitStreaksList habits={habits} onViewAllPress={navigateToHabits} />
          )}

          {/* Today's Reminders notifications widget */}
          {notifications && (
            <TodayRemindersList notifications={notifications} onManagePress={navigateToNotifications} />
          )}

          {/* Travel Recovery Plan Card */}
          {recovery && recovery.plan.status === 'active' && (
            <Card
              variant="solid"
              style={styles.recoveryCard}
              onPress={() => router.push('/travel/recovery' as any)}
            >
              <View style={styles.recoveryHeaderRow}>
                <Ionicons name="fitness" size={22} color={colors.warning} />
                <Text style={styles.recoveryCardTitle}>Travel Recovery Plan</Text>
                <View style={styles.recoveryBadge}>
                  <Text style={styles.recoveryBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.recoveryCardSurplus}>
                Remaining surplus:{' '}
                <Text style={{ color: colors.warning, fontWeight: '700' }}>
                  {recovery.plan.totalSurplusCalories} kcal
                </Text>
              </Text>
              <View style={styles.recoveryProgressWrapper}>
                <Text style={styles.recoveryProgressText}>
                  Day {recovery.currentDayNumber} of {recovery.plan.recoveryDays} ({recovery.percentage}%)
                </Text>
                <View style={styles.recoveryProgressBg}>
                  <View
                    style={[styles.recoveryProgressFill, { width: `${recovery.percentage}%` }]}
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Quick Actions Scroll Grid */}
          <QuickActionsGrid actions={QUICK_ACTIONS} onActionPress={handleAction} />

          {/* Logged Meals List */}
          <LoggedMealsList meals={meals} onAddFoodPress={handleAddFoodPress} />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dashboardScoresRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  scoreBadgeItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: 0,
  },
  scoreBadgeNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand,
  },
  scoreBadgeLbl: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  quickMetricsCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  quickMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickMetricBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMetricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  quickMetricLbl: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginLeft: spacing.xs,
  },
  quickMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  recoveryCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderColor: colors.warning,
    borderWidth: 1,
    backgroundColor: `${colors.warning}05`,
  },
  recoveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recoveryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: spacing.xs,
    flex: 1,
  },
  recoveryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.warning,
  },
  recoveryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
  },
  recoveryCardSurplus: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
  },
  recoveryProgressWrapper: {
    gap: spacing.xs,
  },
  recoveryProgressText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    fontWeight: '600',
  },
  recoveryProgressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  recoveryProgressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default DashboardContainer;
