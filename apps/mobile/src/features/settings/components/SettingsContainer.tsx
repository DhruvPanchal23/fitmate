import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { useSettings } from '../../../hooks/use-settings';

interface ToggleSettingProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function ToggleSetting({ icon, title, description, active, onToggle }: ToggleSettingProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={20} color={colors.brand} />
        </View>
        <View style={styles.settingTextContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
      </View>
      <Pressable
        onPress={onToggle}
        style={[
          styles.switchTrack,
          active ? styles.switchTrackActive : styles.switchTrackInactive,
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            active ? styles.switchThumbActive : styles.switchThumbInactive,
          ]}
        />
      </Pressable>
    </View>
  );
}

export function SettingsContainer() {
  const router = useRouter();
  const {
    metricUnits,
    pushNotifications,
    waterReminder,
    appleHealthSync,
    toggleMetricUnits,
    togglePushNotifications,
    toggleWaterReminder,
    toggleAppleHealthSync,
    handleAction,
  } = useSettings();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Settings"
        showBackButton={true}
        onBackButtonPress={() => router.back()}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.groupTitle}>Preferences</Text>
        <Card variant="solid" style={styles.groupCard}>
          <ToggleSetting
            icon="bar-chart"
            title="Use Metric Units"
            description="Toggle between kg/cm and lbs/inches"
            active={metricUnits}
            onToggle={toggleMetricUnits}
          />
          <ToggleSetting
            icon="notifications"
            title="Push Notifications"
            description="Get daily logging reminders"
            active={pushNotifications}
            onToggle={togglePushNotifications}
          />
          <ToggleSetting
            icon="water"
            title="Hydration Reminders"
            description="Remind to drink water every 2 hours"
            active={waterReminder}
            onToggle={toggleWaterReminder}
          />
        </Card>

        <Text style={styles.groupTitle}>Integrations</Text>
        <Card variant="solid" style={styles.groupCard}>
          <ToggleSetting
            icon="fitness"
            title="Apple Health / Google Fit"
            description="Sync daily activity & steps"
            active={appleHealthSync}
            onToggle={toggleAppleHealthSync}
          />
        </Card>

        <Text style={styles.groupTitle}>Support</Text>
        <Card variant="solid" style={styles.groupCard}>
          <Pressable onPress={() => handleAction('Help Center')} style={styles.listRow}>
            <Text style={styles.rowText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable onPress={() => handleAction('Privacy Policy')} style={styles.listRow}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable onPress={() => handleAction('Terms of Service')} style={styles.listRow}>
            <Text style={styles.rowText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceTertiary} />
          </Pressable>
        </Card>

        <Text style={styles.versionText}>FitMate v1.0.0 (Beta)</Text>

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
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTextContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: colors.brand,
  },
  switchTrackInactive: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  rowText: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: colors.onSurfaceTertiary,
    fontSize: 12,
    marginVertical: spacing.xl,
  },
  bottomSpacer: {
    height: 60,
  },
});
export default SettingsContainer;
