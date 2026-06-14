import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { travelService } from '../../../services/travel-service';
import { ASSETS } from '../../../constants/assets';
import Toast from 'react-native-toast-message';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  color?: string;
}

function SettingRow({ icon, title, onPress, showChevron = true, color = colors.brand }: SettingRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconContainer, { backgroundColor: colors.brandTertiary }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />}
    </Pressable>
  );
}

export function ProfileContainer() {
  const router = useRouter();
  const [stats, setStats] = useState({
    streak: 5,
    activeDays: 24,
    waterTotal: 14.5,
    scannedMealsCount: 12,
  });

  useEffect(() => {
    travelService.getTravelStats().then(setStats).catch(() => {});
  }, []);

  const handleLogout = () => {
    Toast.show({
      type: 'info',
      text1: 'Logged Out',
      text2: 'Session closed. Returning to sign-in.',
    });
    router.replace('/(auth)/login' as any);
  };

  const handleAction = (title: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: `${title} is a mock screen row.`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader title="My Profile" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <Image source={{ uri: ASSETS.images.homeHeaderAvatar }} style={styles.avatar} />
          <Text style={styles.userName}>Dhruv</Text>
          <Text style={styles.userLevel}>FitMate Champion</Text>
        </View>

        <Card variant="solid" style={styles.statsCard}>
          <Text style={styles.statsHeader}>Daily Streak & Achievements</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.activeDays}</Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.scannedMealsCount}</Text>
              <Text style={styles.statLabel}>Meals Scanned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.waterTotal}L</Text>
              <Text style={styles.statLabel}>Water Logged</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Account Options</Text>
        
        <Card variant="solid" style={styles.listCard}>
          <SettingRow
            icon="person"
            title="Edit Profile"
            onPress={() => handleAction('Edit Profile')}
          />
          <SettingRow
            icon="analytics"
            title="Weekly Health Report"
            onPress={() => handleAction('Weekly Health Report')}
          />
          <SettingRow
            icon="notifications"
            title="Notification Preferences"
            onPress={() => handleAction('Notification Preferences')}
          />
          <SettingRow
            icon="settings"
            title="App Settings"
            onPress={() => router.navigate('/settings' as any)}
          />
          <SettingRow
            icon="log-out"
            title="Log Out"
            onPress={handleLogout}
            showChevron={false}
            color={colors.error}
          />
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
  userCard: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.brand,
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  userLevel: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
    marginTop: 2,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  listCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    backgroundColor: colors.surfaceTertiary,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});
export default ProfileContainer;
