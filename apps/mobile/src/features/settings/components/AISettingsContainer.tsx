import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import useAISettings from '../../../hooks/use-ai-settings';

export function AISettingsContainer() {
  const router = useRouter();
  const {
    providers,
    tokenUsage,
    cost,
    cacheStats,
    health,
    isLoading,
    refetchAll,
    setActiveProvider,
    clearCache,
  } = useAISettings();

  useEffect(() => {
    refetchAll();
  }, []);

  const getProviderIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    switch (name.toLowerCase()) {
      case 'gemini':
        return 'logo-google';
      case 'openai':
        return 'sparkles';
      case 'anthropic':
        return 'flask';
      default:
        return 'desktop-outline';
    }
  };

  const formatCost = (val?: number) => {
    if (val === undefined) return '$0.000';
    return `$${val.toFixed(4)}`;
  };

  const activeProvider = providers.find((p) => p.isActive);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="AI Settings"
        subtitle="Manage LLM providers & memory engine"
        showBackButton={true}
        onBackButtonPress={() => router.back()}
      />

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Loading AI Diagnostics...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Provider Status Card */}
          <Text style={styles.groupTitle}>Active Foundation Provider</Text>
          <Card variant="solid" style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.activeHeaderLeft}>
                <Ionicons
                  name={activeProvider ? getProviderIcon(activeProvider.name) : 'sparkles'}
                  size={24}
                  color={colors.brand}
                />
                <Text style={styles.activeName}>
                  {activeProvider ? activeProvider.name.toUpperCase() : 'NO ACTIVE PROVIDER'}
                </Text>
              </View>
              <View style={styles.badge}>
                <View style={styles.greenDot} />
                <Text style={styles.badgeText}>Active</Text>
              </View>
            </View>
            <Text style={styles.modelName}>
              Model: {activeProvider ? activeProvider.model : 'N/A'}
            </Text>
          </Card>

          {/* Provider Selector List */}
          <Text style={styles.groupTitle}>Switch AI Provider (With Fallback Chain)</Text>
          <Card variant="solid" style={styles.providerCardList}>
            {providers.map((p) => {
              const isSelected = p.isActive;
              return (
                <Pressable
                  key={p.name}
                  onPress={() => setActiveProvider(p.name)}
                  style={[
                    styles.providerItem,
                    isSelected && styles.providerItemSelected,
                  ]}
                >
                  <View style={styles.providerLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name={getProviderIcon(p.name)}
                        size={18}
                        color={isSelected ? '#FFFFFF' : colors.onSurfaceSecondary}
                      />
                    </View>
                    <View style={styles.providerDetails}>
                      <Text style={styles.providerNameText}>{p.name.toUpperCase()}</Text>
                      <Text style={styles.providerModelText}>{p.model}</Text>
                    </View>
                  </View>
                  <View style={styles.providerRight}>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={colors.brand} />
                    ) : (
                      <View style={styles.radioOutline} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </Card>

          {/* AI Cache Stats */}
          <Text style={styles.groupTitle}>Semantic Cache Engine</Text>
          <Card variant="solid" style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{cacheStats?.totalEntries || 0}</Text>
                <Text style={styles.metricLabel}>Cached Entries</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{cacheStats?.cacheHits || 0}</Text>
                <Text style={styles.metricLabel}>Cache Hits</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{cacheStats?.cacheMisses || 0}</Text>
                <Text style={styles.metricLabel}>Cache Misses</Text>
              </View>
            </View>

            <Pressable onPress={() => clearCache()} style={styles.clearCacheBtn}>
              <Ionicons name="trash-outline" size={16} color="#FF453A" style={{ marginRight: 6 }} />
              <Text style={styles.clearCacheText}>Clear Prompt Cache</Text>
            </Pressable>
          </Card>

          {/* Usage Metrics & Cost */}
          <Text style={styles.groupTitle}>Token & Cost Diagnostics</Text>
          <Card variant="solid" style={styles.metricCard}>
            <View style={styles.costHeader}>
              <Text style={styles.costBig}>{formatCost(cost?.totalCost)}</Text>
              <Text style={styles.costLabel}>Total Estimated Cost (USD)</Text>
            </View>

            <View style={styles.usageRow}>
              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Total Tokens</Text>
                <Text style={styles.usageVal}>{tokenUsage?.totalTokens || 0}</Text>
              </View>
              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Total Invocations</Text>
                <Text style={styles.usageVal}>{tokenUsage?.invocationsCount || 0}</Text>
              </View>
            </View>

            {/* Provider Token Share */}
            {tokenUsage?.providerUsage && Object.keys(tokenUsage.providerUsage).length > 0 && (
              <View style={styles.breakdown}>
                <Text style={styles.breakdownTitle}>Token Share by Provider:</Text>
                {Object.entries(tokenUsage.providerUsage).map(([name, tokens]) => (
                  <View key={name} style={styles.breakdownRow}>
                    <Text style={styles.breakdownName}>{name.toUpperCase()}</Text>
                    <Text style={styles.breakdownValue}>{tokens} tokens</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* AI Diagnostics & Memory Hook */}
          <Text style={styles.groupTitle}>User Intelligence</Text>
          <Card variant="solid" style={styles.actionCard}>
            <Pressable
              onPress={() => router.push('/memories' as any)}
              style={styles.actionRow}
            >
              <View style={styles.actionLeft}>
                <View style={styles.actionIconWrapper}>
                  <Ionicons name="bulb-outline" size={18} color={colors.brand} />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Long-Term Memories Engine</Text>
                  <Text style={styles.actionDesc}>View, pin or clear user facts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceTertiary} />
            </Pressable>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
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
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.brandSecondary,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  activeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30D158',
  },
  modelName: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  providerCardList: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    marginBottom: spacing.lg,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  providerItemSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.05)',
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleSelected: {
    backgroundColor: colors.brand,
  },
  providerDetails: {
    justifyContent: 'center',
  },
  providerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  providerModelText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  providerRight: {
    justifyContent: 'center',
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  metricCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  clearCacheText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF453A',
  },
  costHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.md,
  },
  costBig: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.brand,
  },
  costLabel: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  usageItem: {
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginBottom: 4,
  },
  usageVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  breakdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    padding: spacing.md,
    borderRadius: 8,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
    marginBottom: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownName: {
    fontSize: 11,
    color: colors.onSurface,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  actionCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
export default AISettingsContainer;
