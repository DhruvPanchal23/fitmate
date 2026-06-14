import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonItem({ width = '100%', height = 20, borderRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1, // infinite loop
      true // reverse on repeat
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.cardHeader}>
        <SkeletonItem width={40} height={40} borderRadius={20} style={styles.marginRight} />
        <View style={styles.headerText}>
          <SkeletonItem width="50%" height={16} style={styles.marginBottom} />
          <SkeletonItem width="30%" height={12} />
        </View>
      </View>
      <SkeletonItem width="100%" height={80} borderRadius={radius.md} style={styles.marginTop} />
    </View>
  );
}

export function SkeletonDashboard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.dashboardContainer, style]}>
      {/* Circle Ring Skeleton */}
      <View style={styles.centerSkeleton}>
        <SkeletonItem width={160} height={160} borderRadius={80} />
      </View>
      {/* Bars Skeletons */}
      <View style={styles.barsContainer}>
        <SkeletonItem width="100%" height={24} style={styles.marginVertical} />
        <SkeletonItem width="100%" height={24} style={styles.marginVertical} />
        <SkeletonItem width="100%" height={24} style={styles.marginVertical} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceTertiary,
  },
  cardContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  marginRight: {
    marginRight: spacing.md,
  },
  marginBottom: {
    marginBottom: spacing.xs,
  },
  marginTop: {
    marginTop: spacing.md,
  },
  marginVertical: {
    marginVertical: spacing.sm,
  },
  dashboardContainer: {
    width: '100%',
    padding: spacing.md,
  },
  centerSkeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  barsContainer: {
    marginTop: spacing.md,
  },
});
