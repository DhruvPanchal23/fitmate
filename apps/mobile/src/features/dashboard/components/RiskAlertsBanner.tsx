import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface AlertItem {
  type: string;
  description: string;
  riskLevel: string;
}

interface RiskAlertsBannerProps {
  alerts: AlertItem[];
}

export const RiskAlertsBanner = React.memo(({ alerts }: RiskAlertsBannerProps) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert, idx) => (
        <Card
          key={idx}
          variant="solid"
          style={StyleSheet.flatten([
            styles.riskBannerCard,
            alert.riskLevel === 'high' ? styles.riskBannerCardHigh : undefined,
          ])}
        >
          <View style={styles.riskBannerHeader}>
            <Ionicons name="alert-circle" size={18} color={alert.riskLevel === 'high' ? colors.error : colors.warning} />
            <Text style={styles.riskBannerTitle}>{alert.type.toUpperCase().replace('_', ' ')} ALERT</Text>
          </View>
          <Text style={styles.riskBannerDescription}>{alert.description}</Text>
        </Card>
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  riskBannerCard: {
    backgroundColor: `${colors.warning}15`,
    borderColor: colors.warning,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  riskBannerCardHigh: {
    backgroundColor: `${colors.error}15`,
    borderColor: colors.error,
  },
  riskBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  riskBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  riskBannerDescription: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    lineHeight: 18,
  },
});

export default RiskAlertsBanner;
