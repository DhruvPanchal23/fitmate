import React from 'react';
import { Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'glass':
        return {
          container: styles.glassContainer,
          text: styles.glassText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.sizeSmContainer,
          text: styles.sizeSmText,
        };
      case 'lg':
        return {
          container: styles.sizeLgContainer,
          text: styles.sizeLgText,
        };
      case 'md':
      default:
        return {
          container: styles.sizeMdContainer,
          text: styles.sizeMdText,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <AnimatedPressable
      onPress={!disabled && !loading ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.baseContainer,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledContainer,
        animatedStyle,
        style,
      ]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.brand}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            variantStyle.text,
            sizeStyle.text,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primaryContainer: {
    backgroundColor: colors.brandPrimary,
  },
  primaryText: {
    color: colors.onBrandPrimary,
  },
  secondaryContainer: {
    backgroundColor: colors.brandSecondary,
  },
  secondaryText: {
    color: colors.onBrandSecondary,
  },
  glassContainer: {
    backgroundColor: colors.glassBackground,
    borderColor: colors.glassBorder,
  },
  glassText: {
    color: colors.onSurface,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.onError,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
  outlineText: {
    color: colors.onSurface,
  },
  // Sizes
  sizeSmContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sizeSmText: {
    fontSize: 12,
  },
  sizeMdContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sizeMdText: {
    fontSize: 14,
  },
  sizeLgContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  sizeLgText: {
    fontSize: 16,
  },
  // Disabled
  disabledContainer: {
    backgroundColor: colors.surfaceTertiary,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  disabledText: {
    color: colors.onSurfaceTertiary,
  },
});
