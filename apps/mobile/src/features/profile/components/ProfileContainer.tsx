import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useProfile } from '../../../hooks/use-profile';

export function ProfileContainer() {
  const router = useRouter();
  const {
    profile,
    completion,
    healthScore,
    recommendations,
    loading,
    isRefetching,
    reloadAll,
    updateProfile,
  } = useProfile();

  const handleRecalculate = () => {
    if (profile) {
      updateProfile({
        fullName: profile.fullName,
        gender: profile.demographics?.gender || 'male',
        age: profile.demographics?.age || 25,
        height: profile.demographics?.height || 170,
        weight: profile.demographics?.weight || 70,
        targetWeight: profile.demographics?.targetWeight || 70,
        activityLevel: (profile.lifestyle?.activityLevel || 'sedentary') as any,
        goal: (profile.lifestyle?.goal || 'maintenance') as any,
        dietPreference: (profile.nutrition?.dietPreference || 'non_veg') as any,
        allergies: profile.nutrition?.allergies || [],
        dislikedFoods: profile.nutrition?.dislikedFoods || [],
        preferredFoods: profile.nutrition?.preferredFoods || [],
        gymExperience: (profile.lifestyle?.gymExperience || 'beginner') as any,
        workoutDays: profile.lifestyle?.workoutDays || 0,
        sleepHours: profile.lifestyle?.sleepHours || 8,
        wakeUpTime: profile.lifestyle?.wakeUpTime || '07:00',
        mealFrequency: profile.lifestyle?.mealFrequency || 3,
        measurementSystem: profile.nutrition?.measurementSystem || 'metric',
        medicalNotes: profile.nutrition?.medicalNotes || '',
      });
    }
  };

  const targets = profile?.calculatedTargets;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader title="My Fitness Profile" subtitle="Your metabolic status & goal parameters" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reloadAll}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* Profile Completion / Setup CTA */}
        {completion && completion.completionScore < 100 && (
          <Card variant="glass" style={styles.ctaCard}>
            <View style={styles.ctaHeader}>
              <Ionicons name="sparkles" size={20} color={colors.brand} />
              <Text style={styles.ctaTitle}>Profile Quality: {completion.completionScore}%</Text>
            </View>
            <Text style={styles.ctaText}>
              {completion.isReadyForAI
                ? 'Your profile is ready for AI coaching, but filling missing fields increases accuracy!'
                : 'Your profile has low completion. Fill missing fields to unlock optimal AI meal planning.'}
            </Text>
            {completion.missingFields.length > 0 && (
              <Text style={styles.missingLabel}>Missing: {completion.missingFields.slice(0, 3).join(', ')}...</Text>
            )}
            <Button
              title="Resume Setup Wizard"
              onPress={() => router.push('/profile/wizard' as any)}
              size="sm"
              style={styles.ctaButton}
            />
          </Card>
        )}

        {/* Recalculation Alerts */}
        {recommendations?.shouldRecommendRecalculation && (
          <Card variant="solid" style={styles.alertCard} accentColor={colors.warning}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <Text style={styles.alertTitle}>Calorie Target Alert</Text>
            </View>
            <Text style={styles.alertText}>{recommendations.message}</Text>
            <Button
              title="Recalculate Calorie Targets"
              onPress={handleRecalculate}
              size="sm"
              style={styles.alertButton}
            />
          </Card>
        )}

        {/* Health Score Overview */}
        {healthScore && (
          <Card variant="glass" style={styles.healthScoreCard}>
            <View style={styles.healthScoreHeader}>
              <View>
                <Text style={styles.healthScoreTitle}>Health Score</Text>
                <Text style={styles.healthScoreDesc}>Based on BMI, hydration, and sleep logs.</Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{healthScore.healthScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>

            <Text style={styles.recsTitle}>AI Recommendations</Text>
            {healthScore.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recRow}>
                <Ionicons name="arrow-forward-circle" size={14} color={colors.brand} />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Core Stats Card */}
        {profile && (
          <Card variant="solid" style={styles.statsCard}>
            <Text style={styles.sectionHeader}>Body Dimensions</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{profile.demographics?.weight} {profile.measurementSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
                <Text style={styles.statLabel}>Current Weight</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{profile.demographics?.height} {profile.measurementSystem === 'imperial' ? 'in' : 'cm'}</Text>
                <Text style={styles.statLabel}>Height</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{profile.demographics?.targetWeight} {profile.measurementSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
                <Text style={styles.statLabel}>Goal Weight</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Calculated Goals Card */}
        {targets ? (
          <Card variant="solid" style={styles.goalsCard}>
            <View style={styles.goalsCardHeader}>
              <Text style={styles.sectionHeader}>Metabolic Targets</Text>
              <Text style={styles.formulaText}>Formula: {targets.formula}</Text>
            </View>

            <View style={styles.goalsList}>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Calories Budget</Text>
                <Text style={styles.goalVal}>{targets.calories} kcal</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>BMR (Basal Metabolism)</Text>
                <Text style={styles.goalVal}>{targets.bmr} kcal</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>TDEE (Daily Expenditure)</Text>
                <Text style={styles.goalVal}>{targets.tdee} kcal</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Protein Target</Text>
                <Text style={styles.goalVal}>{targets.protein}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Carbohydrates Target</Text>
                <Text style={styles.goalVal}>{targets.carbs}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Fats Target</Text>
                <Text style={styles.goalVal}>{targets.fats}g</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Hydration Target</Text>
                <Text style={styles.goalVal}>{targets.water} L</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Dietary Fiber Target</Text>
                <Text style={styles.goalVal}>{targets.fiber}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Recommended Creatine</Text>
                <Text style={styles.goalVal}>{targets.creatine}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Sugar Limit</Text>
                <Text style={styles.goalVal}>{targets.sugar}g</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card variant="solid" style={styles.emptyCard}>
            <Ionicons name="calculator-outline" size={36} color={colors.onSurfaceSecondary} />
            <Text style={styles.emptyTitle}>Targets Not Calculated</Text>
            <Text style={styles.emptySubtitle}>Complete the setup wizard to compute your metabolic calorie/macro targets.</Text>
            <Button
              title="Start Onboarding Wizard"
              onPress={() => router.push('/profile/wizard' as any)}
              style={styles.wizardBtn}
            />
          </Card>
        )}

        {/* Progress Tracker Navigation CTA */}
        {profile && (
          <Card variant="solid" style={styles.navCard} onPress={() => router.push('/profile/progress' as any)}>
            <View style={styles.navContent}>
              <Ionicons name="bar-chart-outline" size={22} color={colors.brand} />
              <View style={styles.navInfo}>
                <Text style={styles.navTitle}>Body Progress Tracker</Text>
                <Text style={styles.navSub}>Log weight, body fat, waist lines & view time-series trends.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceSecondary} />
            </View>
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
  ctaCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ctaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  ctaText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    lineHeight: 16,
  },
  missingLabel: {
    fontSize: 11,
    color: colors.brand,
    marginTop: 4,
    fontWeight: '500',
  },
  ctaButton: {
    marginTop: spacing.md,
  },
  alertCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  alertText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
  },
  alertButton: {
    marginTop: spacing.md,
  },
  healthScoreCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  healthScoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  healthScoreDesc: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.brand}10`,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand,
  },
  scoreMax: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
  },
  recsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  recText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  goalsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goalsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  formulaText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  goalsList: {
    gap: spacing.sm,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  goalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  wizardBtn: {
    marginTop: spacing.md,
  },
  navCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  navSub: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});

export default ProfileContainer;
