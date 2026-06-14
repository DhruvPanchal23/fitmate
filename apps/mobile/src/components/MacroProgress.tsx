import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface MacroItemProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  style?: ViewStyle;
}

export function MacroProgressBar({ label, current, target, unit, color, style }: MacroItemProps) {
  const percentage = Math.min(current / target, 1);
  const progressShared = useSharedValue(0);

  useEffect(() => {
    progressShared.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressShared.value * 100}%`,
    };
  });

  return (
    <View style={[styles.barContainer, style]}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValues}>
          {current}
          <Text style={styles.barUnit}>{unit}</Text>
          <Text style={styles.barTarget}> / {target}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

export interface MacroProgressProps {
  calories: {
    current: number;
    target: number;
  };
  protein: {
    current: number;
    target: number;
  };
  carbs: {
    current: number;
    target: number;
  };
  fat: {
    current: number;
    target: number;
  };
  water?: {
    current: number;
    target: number;
  };
}

export function MacroProgress({
  calories,
  protein,
  carbs,
  fat,
  water,
}: MacroProgressProps) {
  const remainingCalories = calories.target - calories.current;
  const calPercent = Math.min(calories.current / calories.target, 1);

  // Sharing progress values for animations
  const outerRingProgress = useSharedValue(0);
  const middleRingProgress = useSharedValue(0);
  const innerRingProgress = useSharedValue(0);

  useEffect(() => {
    outerRingProgress.value = withTiming(Math.min(protein.current / protein.target, 1), {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
    middleRingProgress.value = withTiming(Math.min(carbs.current / carbs.target, 1), {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
    innerRingProgress.value = withTiming(Math.min(fat.current / fat.target, 1), {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
  }, [protein, carbs, fat]);

  return (
    <View style={styles.container}>
      {/* Concentric visual representation using pure styles */}
      <View style={styles.visualSection}>
        <View style={styles.outerRing}>
          <View style={styles.middleRing}>
            <View style={styles.innerRing}>
              <View style={styles.centerTextContainer}>
                <Text style={styles.centerTitle}>
                  {remainingCalories >= 0 ? remainingCalories : Math.abs(remainingCalories)}
                </Text>
                <Text style={styles.centerSubtitle}>
                  {remainingCalories >= 0 ? 'kcal remaining' : 'kcal surplus'}
                </Text>
                <Text style={styles.centerSmall}>
                  Goal: {calories.target}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bars Section */}
      <View style={styles.detailsSection}>
        <MacroProgressBar
          label="Protein"
          current={protein.current}
          target={protein.target}
          unit="g"
          color={colors.brand}
        />
        <MacroProgressBar
          label="Carbohydrates"
          current={carbs.current}
          target={carbs.target}
          unit="g"
          color={colors.brandSecondary}
        />
        <MacroProgressBar
          label="Fats"
          current={fat.current}
          target={fat.target}
          unit="g"
          color={colors.warning}
        />
        {water && (
          <MacroProgressBar
            label="Water Hydration"
            current={water.current}
            target={water.target}
            unit="ml"
            color="#06B6D4" // Cyan
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  visualSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  outerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 8,
    borderColor: 'rgba(16, 185, 129, 0.15)', // transparent brand
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'rgba(59, 130, 246, 0.15)', // transparent blue
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 8,
    borderColor: 'rgba(249, 115, 22, 0.15)', // transparent warning orange
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
  },
  centerSubtitle: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
  },
  centerSmall: {
    fontSize: 9,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  detailsSection: {
    width: '100%',
    marginTop: spacing.md,
  },
  barContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  barValues: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  barUnit: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  barTarget: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
