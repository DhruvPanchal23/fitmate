import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Button } from '../../../components/Button';
import { ASSETS } from '../../../constants/assets';

const SLIDES = [
  {
    id: 1,
    title: 'AI Food Recognition',
    description: 'Simply take a photo of your meal to automatically detect food items, calories, and macros.',
    image: ASSETS.images.onboardScan,
  },
  {
    id: 2,
    title: 'Smart Macro Tracker',
    description: 'Track your daily intake of protein, carbs, fats, water, and supplements with clear progress rings.',
    image: ASSETS.images.onboardMacros,
  },
  {
    id: 3,
    title: 'Adaptive Travel Mode',
    description: 'Enjoy your trips without diet restrictions. Get an AI-designed recovery plan once you return home.',
    image: ASSETS.images.splashBg,
  },
];

export function OnboardingContainer() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      router.replace('/(auth)/login' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login' as any);
  };

  const slide = SLIDES[currentIdx];

  return (
    <View style={styles.container}>
      <Animated.View
        key={currentIdx}
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(400)}
        style={StyleSheet.absoluteFill}
      >
        <ImageBackground
          source={{ uri: slide.image }}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.scrim} />
        </ImageBackground>
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          {currentIdx < SLIDES.length - 1 ? (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIdx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <View style={styles.ctaContainer}>
            <Button
              title={currentIdx === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
              onPress={handleNext}
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 17, 21, 0.75)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    color: colors.onSurfaceSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.sm,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: colors.onSurfaceSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.surfaceTertiary,
  },
  ctaContainer: {
    width: '100%',
  },
});
export default OnboardingContainer;
