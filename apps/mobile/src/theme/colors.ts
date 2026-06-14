export const colors = {
  surface: '#0F1115',
  onSurface: '#F3F4F6',
  surfaceSecondary: '#1A1D24',
  onSurfaceSecondary: '#E5E7EB',
  surfaceTertiary: '#252A33',
  onSurfaceTertiary: '#D1D5DB',
  surfaceInverse: '#F9FAFB',
  onSurfaceInverse: '#111827',
  
  brand: '#10B981', // Emerald green
  brandPrimary: '#10B981',
  onBrandPrimary: '#FFFFFF',
  
  brandSecondary: '#3B82F6', // Blue
  onBrandSecondary: '#FFFFFF',
  
  brandTertiary: '#064E3B',
  onBrandTertiary: '#34D399',
  
  success: '#22C55E',
  onSuccess: '#FFFFFF',
  
  warning: '#F97316',
  onWarning: '#FFFFFF',
  
  error: '#EF4444',
  onError: '#FFFFFF',
  
  info: '#3B82F6',
  onInfo: '#FFFFFF',
  
  border: '#2A2F3A',
  borderStrong: '#374151',
  divider: '#1F242D',
  
  // Custom transparent/glass overlays
  glassBackground: 'rgba(26, 29, 36, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  scrimOverlay: 'rgba(15, 17, 21, 0.7)',
} as const;

export type ThemeColors = typeof colors;
