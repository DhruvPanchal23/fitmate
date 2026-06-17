import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAnalytics } from '../../../hooks/use-analytics';

export default function AnalyticsHomeScreen() {
  const {
    dashboard,
    trends,
    streaks,
    adherence,
    healthScore,
    predictions,
    recommendations,
    insights,
    loading,
    isRefetching,
    dismissInsight,
    reloadData,
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'coaching'>('overview');

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing health metrics...</Text>
      </SafeAreaView>
    );
  }

  // Helper for rendering custom lightweight charts
  const renderWeightChart = (dataPoints: any[]) => {
    if (!dataPoints || dataPoints.length === 0) {
      return (
        <View style={styles.emptyChartContainer}>
          <Text style={styles.emptyChartText}>Not enough logging history to show trends.</Text>
        </View>
      );
    }

    const weights = dataPoints.map((d) => d.weight || 0).filter((w) => w > 0);
    const minWeight = weights.length > 0 ? Math.min(...weights) - 1 : 0;
    const maxWeight = weights.length > 0 ? Math.max(...weights) + 1 : 100;
    const weightRange = maxWeight - minWeight || 1;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weight Trend (kg)</Text>
        <View style={styles.barChartRow}>
          {dataPoints.map((dp, idx) => {
            const w = dp.weight || minWeight;
            const percentage = ((w - minWeight) / weightRange) * 100;
            // Cap height representation
            const barHeight = Math.max(10, Math.min(100, percentage));
            return (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { height: `${barHeight}%`, backgroundColor: colors.brandSecondary }]} />
                </View>
                <Text style={styles.barLabel}>{dp.date.substring(5)}</Text>
                <Text style={styles.barValue}>{w.toFixed(1)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCalorieChart = (dataPoints: any[]) => {
    if (!dataPoints || dataPoints.length === 0) return null;
    const maxCalories = Math.max(...dataPoints.map((d) => d.caloriesConsumed || 2000), 3000);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Calorie Intake vs Target</Text>
        <View style={styles.barChartRow}>
          {dataPoints.map((dp, idx) => {
            const consumed = dp.caloriesConsumed || 0;
            const target = dp.caloriesTarget || 2000;
            const consumedHeight = (consumed / maxCalories) * 100;
            const targetHeight = (target / maxCalories) * 100;

            return (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.doubleBarContainer}>
                  <View style={[styles.barFillDouble, { height: `${consumedHeight}%`, backgroundColor: colors.brand }]} />
                  <View style={[styles.barFillDouble, { height: `${targetHeight}%`, backgroundColor: colors.surfaceTertiary, borderLeftWidth: 1, borderColor: colors.border }]} />
                </View>
                <Text style={styles.barLabel}>{dp.date.substring(5)}</Text>
                <Text style={styles.barValue}>{Math.round(consumed)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.brand }]} />
            <Text style={styles.legendText}>Consumed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.surfaceTertiary }]} />
            <Text style={styles.legendText}>Target</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Intelligence Layer"
        subtitle="AI-driven lifestyle logs and insights"
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['overview', 'trends', 'coaching'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reloadData}
            tintColor={colors.brand}
          />
        }
      >
        {activeTab === 'overview' && (
          <View>
            {/* HEALTH SCORE CARD */}
            {healthScore && (
              <Card variant="glass" style={styles.healthCard}>
                <View style={styles.scoreRow}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{healthScore.score}</Text>
                    <Text style={styles.scoreSub}>Health Score</Text>
                  </View>
                  <View style={styles.breakdownCol}>
                    <Text style={styles.sectionHeader}>Breakdown</Text>
                    
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Nutrition</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFillLine, { width: `${healthScore.breakdown.nutrition}%`, backgroundColor: colors.brand }]} />
                      </View>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Activity</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFillLine, { width: `${healthScore.breakdown.activity}%`, backgroundColor: colors.warning }]} />
                      </View>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Sleep</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFillLine, { width: `${healthScore.breakdown.sleep}%`, backgroundColor: colors.brandSecondary }]} />
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* STREAK CARD */}
            {streaks && (
              <View style={styles.streaksContainer}>
                <Card style={styles.streakItem}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.brand} />
                  <Text style={styles.streakCount}>{streaks.mealStreak.currentStreak}d</Text>
                  <Text style={styles.streakLabel}>Meal logs</Text>
                </Card>
                <Card style={styles.streakItem}>
                  <Ionicons name="barbell-outline" size={20} color={colors.warning} />
                  <Text style={styles.streakCount}>{streaks.workoutStreak.currentStreak}d</Text>
                  <Text style={styles.streakLabel}>Workouts</Text>
                </Card>
                <Card style={styles.streakItem}>
                  <Ionicons name="water-outline" size={20} color={colors.brandSecondary} />
                  <Text style={styles.streakCount}>{streaks.hydrationStreak.currentStreak}d</Text>
                  <Text style={styles.streakLabel}>Water</Text>
                </Card>
              </View>
            )}

            {/* PREDICTIONS CARD */}
            {predictions && (
              <Card style={styles.predictionCard}>
                <Text style={styles.cardHeader}>Future Forecast</Text>
                <View style={styles.predictionRow}>
                  <View style={styles.predictionBox}>
                    <Text style={styles.predictionLabel}>Weight in 30 Days</Text>
                    <Text style={styles.predictionVal}>{predictions.predictedWeight30Days} kg</Text>
                  </View>
                  <View style={styles.predictionBox}>
                    <Text style={styles.predictionLabel}>Goal Target Date</Text>
                    <Text style={styles.predictionVal}>
                      {predictions.predictedGoalCompletionDate
                        ? new Date(predictions.predictedGoalCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : 'Caloric balance stable'}
                    </Text>
                  </View>
                </View>
                {predictions.plateauDetected && (
                  <View style={styles.plateauWarning}>
                    <Ionicons name="warning-outline" size={18} color={colors.warning} />
                    <Text style={styles.plateauText}>
                      Plateau Detected: Weight flat for {predictions.plateauDurationDays} days. Check recommendations!
                    </Text>
                  </View>
                )}
              </Card>
            )}

            {/* RISK ALERTS */}
            {dashboard && dashboard.riskAlerts && dashboard.riskAlerts.length > 0 && (
              <View>
                <Text style={styles.subHeader}>Risk Alerts</Text>
                {dashboard.riskAlerts.map((alert, idx) => (
                  <Card key={idx} style={StyleSheet.flatten([styles.riskCard, alert.riskLevel === 'high' && styles.riskCardHigh])}>
                    <View style={styles.riskHeader}>
                      <Ionicons name="alert-circle" size={20} color={alert.riskLevel === 'high' ? colors.error : colors.warning} />
                      <Text style={styles.riskTitle}>{alert.type.toUpperCase().replace('_', ' ')}</Text>
                      <View style={[styles.riskBadge, alert.riskLevel === 'high' ? styles.riskBadgeHigh : styles.riskBadgeMed]}>
                        <Text style={styles.riskBadgeText}>{alert.riskLevel}</Text>
                      </View>
                    </View>
                    <Text style={styles.riskDescription}>{alert.description}</Text>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'trends' && trends && (
          <View>
            {renderWeightChart(trends.weekly)}
            {renderCalorieChart(trends.weekly)}
          </View>
        )}

        {activeTab === 'coaching' && (
          <View>
            {/* INSIGHTS */}
            {insights && insights.length > 0 && (
              <View>
                <Text style={styles.subHeader}>Insights</Text>
                {insights.map((insight) => (
                  <Card key={insight.id} style={styles.insightCard}>
                    <View style={styles.insightHeaderRow}>
                      <Ionicons
                        name={insight.category === 'plateau' ? 'analytics-outline' : 'bulb-outline'}
                        size={20}
                        color={colors.brandSecondary}
                      />
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Pressable onPress={() => dismissInsight(insight.id)}>
                        <Ionicons name="close-circle-outline" size={20} color={colors.onSurfaceSecondary} />
                      </Pressable>
                    </View>
                    <Text style={styles.insightDesc}>{insight.description}</Text>
                  </Card>
                ))}
              </View>
            )}

            {/* RECOMMENDATIONS */}
            {recommendations && recommendations.length > 0 && (
              <View>
                <Text style={styles.subHeader}>Coaching Recommendations</Text>
                {recommendations.map((rec) => (
                  <Card key={rec.id} style={styles.recCard}>
                    <View style={styles.recHeaderRow}>
                      <View style={styles.recIconBox}>
                        <Ionicons
                          name={
                            rec.type === 'exercise'
                              ? 'walk'
                              : rec.type === 'nutrition'
                              ? 'fast-food'
                              : rec.type === 'hydration'
                              ? 'water'
                              : 'bed'
                          }
                          size={18}
                          color={colors.brand}
                        />
                      </View>
                      <View style={styles.recTextCol}>
                        <Text style={styles.recTitle}>{rec.title}</Text>
                        <Text style={styles.recDesc}>{rec.description}</Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: radius.md,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceTertiary,
  },
  tabText: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.brand,
  },
  healthCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onSurface,
  },
  scoreSub: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  breakdownCol: {
    flex: 1,
    marginLeft: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 12,
  },
  breakdownItem: {
    marginVertical: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginBottom: 4,
  },
  barBg: {
    height: 6,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 3,
  },
  barFillLine: {
    height: '100%',
    borderRadius: 3,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  streakItem: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 6,
  },
  streakLabel: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  predictionCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionBox: {
    flex: 1,
  },
  predictionLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  predictionVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandSecondary,
    marginTop: 4,
  },
  plateauWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  plateauText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 10,
    marginBottom: 10,
  },
  riskCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
  },
  riskCardHigh: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 8,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskBadgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  riskBadgeMed: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  riskDescription: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    lineHeight: 18,
  },
  emptyChartContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    color: colors.onSurfaceSecondary,
  },
  chartContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 16,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 10,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  barBackground: {
    height: 80,
    width: 14,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  doubleBarContainer: {
    height: 80,
    width: 20,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFillDouble: {
    flex: 1,
  },
  barLabel: {
    fontSize: 9,
    color: colors.onSurfaceSecondary,
    marginTop: 6,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  insightCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 8,
    flex: 1,
  },
  insightDesc: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    lineHeight: 18,
  },
  recCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginVertical: 4,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recTextCol: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  recDesc: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
});
