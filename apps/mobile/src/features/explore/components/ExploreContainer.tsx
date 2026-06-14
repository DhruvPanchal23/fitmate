import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ImageBackground } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { useExplore } from '../../../hooks/use-explore';
import { ASSETS } from '../../../constants/assets';

export function ExploreContainer() {
  const {
    travelModeActive,
    toggleTravelMode,
    stats,
    CALORIE_DATA,
    PROTEIN_DATA,
  } = useExplore();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader title="Explore & Tools" subtitle="Advanced Analytics & Settings" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Travel Mode Hero Card */}
        <Card variant="glass" style={styles.travelCard}>
          <ImageBackground
            source={{ uri: ASSETS.images.travelBg }}
            style={styles.travelBg}
            imageStyle={styles.travelBgImage}
          >
            <View style={styles.travelOverlay}>
              <View style={styles.travelHeaderRow}>
                <View>
                  <Text style={styles.travelTitle}>Travel Mode</Text>
                  <Text style={styles.travelSubtitle}>Pause goals, track surplus</Text>
                </View>
                <Pressable
                  onPress={toggleTravelMode}
                  style={[
                    styles.switchTrack,
                    travelModeActive ? styles.switchTrackActive : styles.switchTrackInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      travelModeActive ? styles.switchThumbActive : styles.switchThumbInactive,
                    ]}
                  />
                </Pressable>
              </View>

              <Text style={styles.travelExplanation}>
                When traveling, log meals without worrying about deficits. FitMate estimates surplus
                and builds an active recovery plan (walking/jogging targets) on your return.
              </Text>
            </View>
          </ImageBackground>
        </Card>

        {/* Analytics Section */}
        <Text style={styles.sectionTitle}>Weekly Consistency</Text>
        
        {/* Streak Summary */}
        <Card variant="solid" style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={32} color={colors.warning} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakCount}>{stats.streak}-Day Tracking Streak!</Text>
              <Text style={styles.streakDesc}>You met your protein goals on {stats.streak} of 7 days.</Text>
            </View>
          </View>
        </Card>

        {/* Calorie Intake Chart */}
        <Card variant="solid" style={styles.chartCard}>
          <Text style={styles.chartTitle}>Calorie Intake Trend</Text>
          <Text style={styles.chartSubtitle}>Target: 2,200 kcal average</Text>
          
          <View style={styles.barChartContainer}>
            {CALORIE_DATA.map((d, idx) => {
              const maxVal = 3000;
              const barHeight = (d.val / maxVal) * 120;
              const isOver = d.val > d.target;
              
              return (
                <View key={idx} style={styles.chartCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: isOver ? colors.warning : colors.brand,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Protein Intake Chart */}
        <Card variant="solid" style={styles.chartCard}>
          <Text style={styles.chartTitle}>Protein Consistency</Text>
          <Text style={styles.chartSubtitle}>Target: 150g average</Text>
          
          <View style={styles.barChartContainer}>
            {PROTEIN_DATA.map((d, idx) => {
              const maxVal = 200;
              const barHeight = (d.val / maxVal) * 120;
              const met = d.val >= d.target;
              
              return (
                <View key={idx} style={styles.chartCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: met ? colors.brandSecondary : colors.surfaceTertiary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom wrapper to ensure SafeAreaView uses React Native Elements correctly
function SafeAreaView({ children, style, edges }: any) {
  const insets = require('react-native-safe-area-context').useSafeAreaInsets();
  const styleCombined = [
    {
      flex: 1,
      backgroundColor: colors.surface,
      paddingBottom: edges?.includes('bottom') ? insets.bottom : 0,
    },
    style,
  ];
  return <View style={styleCombined}>{children}</View>;
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
  travelCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  travelBg: {
    width: '100%',
  },
  travelBgImage: {
    opacity: 0.25,
  },
  travelOverlay: {
    padding: spacing.lg,
    backgroundColor: 'rgba(15, 17, 21, 0.6)',
  },
  travelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  travelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  travelSubtitle: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: colors.brand,
  },
  switchTrackInactive: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  travelExplanation: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  streakCard: {
    marginBottom: spacing.lg,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  streakDesc: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  chartCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: spacing.sm,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 120,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.pill,
  },
  barLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});
export default ExploreContainer;
