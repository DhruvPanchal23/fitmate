import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
  avatarUrl?: string;
  showBackButton?: boolean;
  onBackButtonPress?: () => void;
}

export function ScreenHeader({
  title,
  subtitle,
  showAvatar = false,
  avatarUrl = 'https://images.unsplash.com/photo-1598735064309-86f7f4ba875b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMG1hbiUyMHByb2ZpbGUlMjBwb3J0cmFpdCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4MTE4NzM4N3ww&ixlib=rb-4.1.0&q=85',
  showBackButton = false,
  onBackButtonPress,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackButtonPress) {
      onBackButtonPress();
    } else {
      router.back();
    }
  };

  const handleAvatarPress = () => {
    // Navigate to profile (which sits inside tabs stack or is a sibling route)
    router.navigate('/(tabs)/profile' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.contentRow}>
        {showBackButton && (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        {showAvatar && (
          <Pressable onPress={handleAvatarPress} style={styles.avatarButton}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              transition={200}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  avatarButton: {
    marginLeft: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
