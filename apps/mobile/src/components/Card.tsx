import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  children: React.ReactNode;
  variant?: 'solid' | 'glass' | 'outlined';
  onPress?: () => void;
  accentColor?: string; // Left border accent color
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'solid',
  onPress,
  accentColor,
  style,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 12, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  };

  const cardStyle = [
    styles.baseCard,
    variant === 'solid' && styles.solidCard,
    variant === 'glass' && styles.glassCard,
    variant === 'outlined' && styles.outlinedCard,
    accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  solidCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  glassCard: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
