import { TextStyle } from 'react-native';

export const fontSizes = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  display: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: 52,
    letterSpacing: -1.0,
  } as TextStyle,
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: 44,
    letterSpacing: -0.5,
  } as TextStyle,
  subtitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    letterSpacing: -0.2,
  } as TextStyle,
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  } as TextStyle,
  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  } as TextStyle,
  bodyBold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    lineHeight: 20,
  } as TextStyle,
  button: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
  } as TextStyle,
} as const;

export type TypographySystem = typeof typography;
