import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ASSETS } from '../../../constants/assets';

export function SplashContainer() {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1.0, { duration: 800 })
      ),
      -1,
      true
    );

    const timer = setTimeout(() => {
      router.replace('/(onboarding)' as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <ImageBackground
      source={{ uri: ASSETS.images.splashBg }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
            <Ionicons name="flame" size={80} color={colors.brand} />
          </Animated.View>
          
          <Text style={styles.appName}>FitMate</Text>
          <Text style={styles.tagline}>Your AI Fitness & Nutrition Companion</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 21, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.md,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
export default SplashContainer;
