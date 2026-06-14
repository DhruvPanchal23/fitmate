import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { useMealPlanner } from '../../../hooks/use-meal-planner';
import Toast from 'react-native-toast-message';

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: 'cafe',
  lunch: 'nutrition',
  dinner: 'fast-food',
  snack: 'leaf',
};

const PLAN_STATUS_COLOR: Record<string, string> = {
  draft: colors.warning,
  active: colors.success,
  archived: colors.onSurfaceSecondary,
};

const MEAL_STATUS_COLOR: Record<string, string> = {
  planned: colors.info,
  completed: colors.success,
  skipped: colors.onSurfaceSecondary,
  replaced: colors.warning,
};

export function PlannerContainer() {
  const {
    allPlans,
    activePlan,
    analytics,
    loading,
    isRefetching,
    generatePlan,
    activatePlan,
    completeMeal,
    skipMeal,
    reloadData,
  } = useMealPlanner();

  const hasPlans = allPlans.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Meal Planner"
        subtitle="AI-powered nutrition plans"
      />

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
        {/* Generate Plan CTA Card */}
        <Card
          variant="glass"
          onPress={() => {
            generatePlan.mutate({
              title: 'My Plan',
              type: 'daily',
              goal: 'maintenance',
            });
          }}
          style={styles.ctaCard}
        >
          <View style={styles.ctaRow}>
            <View style={[styles.ctaIconBox, { backgroundColor: `${colors.brand}20` }]}>
              <Ionicons name="sparkles" size={28} color={colors.brand} />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Generate New Plan</Text>
              <Text style={styles.ctaSubtitle}>
                AI creates a personalized daily or weekly plan
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
          </View>
        </Card>

        {/* Active Plan Section */}
        {activePlan && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Active Plan</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: `${PLAN_STATUS_COLOR[activePlan.status]}20` }]}>
                  <Text style={[styles.badgeText, { color: PLAN_STATUS_COLOR[activePlan.status] }]}>
                    {activePlan.status.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${colors.info}20` }]}>
                  <Text style={[styles.badgeText, { color: colors.info }]}>
                    {activePlan.type.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.planTitle}>{activePlan.title}</Text>

            {activePlan.days.map((day) => (
              <View key={day.id} style={styles.dayContainer}>
                <View style={styles.dayHeader}>
                  <Ionicons name="calendar-outline" size={16} color={colors.brand} />
                  <Text style={styles.dayTitle}>{day.dayOfWeek}</Text>
                  <Text style={styles.dayCalories}>{Math.round(day.calories)} kcal</Text>
                </View>

                {day.meals.map((meal) => (
                  <Card key={meal.id} variant="solid" style={styles.mealCard}>
                    <View style={styles.mealRow}>
                      <View style={styles.mealLeft}>
                        <View style={styles.mealIconContainer}>
                          <Ionicons
                            name={(MEAL_TYPE_ICONS[meal.mealType.toLowerCase()] || 'restaurant') as any}
                            size={18}
                            color={colors.brand}
                          />
                        </View>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName} numberOfLines={1}>
                            {meal.foodName}
                          </Text>
                          <Text style={styles.mealMeta}>
                            {meal.mealType} • {meal.quantity}{meal.unit}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.mealRight}>
                        <Text style={styles.mealCalories}>{Math.round(meal.calories)} kcal</Text>
                        <View style={[styles.statusDot, { backgroundColor: MEAL_STATUS_COLOR[meal.status] }]} />
                      </View>
                    </View>

                    {meal.status === 'planned' && (
                      <View style={styles.mealActions}>
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: `${colors.success}15` }]}
                          onPress={() => completeMeal.mutate(meal.id)}
                        >
                          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                          <Text style={[styles.actionText, { color: colors.success }]}>Complete</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: `${colors.onSurfaceSecondary}15` }]}
                          onPress={() => skipMeal.mutate(meal.id)}
                        >
                          <Ionicons name="close-circle" size={18} color={colors.onSurfaceSecondary} />
                          <Text style={[styles.actionText, { color: colors.onSurfaceSecondary }]}>Skip</Text>
                        </Pressable>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Plans List Section */}
        {hasPlans && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Plans</Text>

            {allPlans.map((plan) => (
              <Card
                key={plan.id}
                variant="solid"
                onPress={() => {
                  if (plan.status === 'draft') {
                    activatePlan.mutate(plan.id);
                  } else {
                    Toast.show({
                      type: 'info',
                      text1: plan.title,
                      text2: `Status: ${plan.status} • ${plan.type} plan`,
                    });
                  }
                }}
                style={styles.planCard}
              >
                <View style={styles.planCardHeader}>
                  <Text style={styles.planCardTitle} numberOfLines={1}>{plan.title}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: `${PLAN_STATUS_COLOR[plan.status]}20` }]}>
                      <Text style={[styles.badgeText, { color: PLAN_STATUS_COLOR[plan.status] }]}>
                        {plan.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: `${colors.info}20` }]}>
                      <Text style={[styles.badgeText, { color: colors.info }]}>
                        {plan.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.planCardDetails}>
                  <View style={styles.planDetailItem}>
                    <Ionicons name="flame-outline" size={14} color={colors.warning} />
                    <Text style={styles.planDetailText}>{Math.round(plan.caloriesTarget)} kcal target</Text>
                  </View>
                  <View style={styles.planDetailItem}>
                    <Ionicons name="time-outline" size={14} color={colors.onSurfaceSecondary} />
                    <Text style={styles.planDetailText}>
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {plan.status === 'draft' && (
                  <Text style={styles.tapHint}>Tap to activate</Text>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Analytics Summary Card */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <Card variant="glass" style={styles.analyticsCard}>
              {/* Adherence Progress */}
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Adherence</Text>
                <Text style={styles.analyticsValue}>
                  {Math.round(analytics.adherencePercentage ?? 0)}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(analytics.adherencePercentage ?? 0, 100)}%` },
                  ]}
                />
              </View>

              <View style={styles.analyticsCounters}>
                <View style={styles.counterItem}>
                  <View style={[styles.counterDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.counterLabel}>Completed</Text>
                  <Text style={styles.counterValue}>{analytics.completedMeals ?? 0}</Text>
                </View>
                <View style={styles.counterItem}>
                  <View style={[styles.counterDot, { backgroundColor: colors.onSurfaceSecondary }]} />
                  <Text style={styles.counterLabel}>Skipped</Text>
                  <Text style={styles.counterValue}>{analytics.skippedMeals ?? 0}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Empty State */}
        {!hasPlans && !loading && (
          <Card variant="solid" style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={40} color={colors.onSurfaceSecondary} />
            <Text style={styles.emptyText}>No meal plans yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Generate New Plan" above to create your first AI-powered meal plan!
            </Text>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  // CTA Card
  ctaCard: {
    marginBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Day
  dayContainer: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    flex: 1,
  },
  dayCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
  },

  // Meal Card
  mealCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  mealMeta: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  mealRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Meal Actions
  mealActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Plan Card
  planCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
    marginRight: spacing.sm,
  },
  planCardDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  planDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  planDetailText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
  },
  tapHint: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  // Analytics
  analyticsCard: {
    marginBottom: spacing.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  analyticsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
  analyticsCounters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counterLabel: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },

  // Empty State
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});

export default PlannerContainer;
