import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import apiClient from '../services/api-client';
import syncService from '../services/sync-service';

export default function DiagnosticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<any>({
    apiStatus: 'Checking...',
    aiStatus: 'Checking...',
    provider: 'Unknown',
    cacheStats: 'Checking...',
    version: '1.0.0 (Beta)',
    environment: 'production',
    lastSync: 'Never',
    latency: 0,
    deviceId: 'Unknown',
    sessionId: 'Unknown',
  });

  const runDiagnostics = async () => {
    setLoading(true);
    const start = Date.now();
    let apiStatus = 'Offline';
    let aiStatus = 'Degraded';
    let provider = 'None';
    let cacheStats = 'Unavailable';
    let latency = 0;
    let deviceId = 'Unknown';
    let sessionId = 'Unknown';
    let lastSync = 'Never';

    try {
      // 1. Get stable Device ID from AsyncStorage
      let storedDeviceId = await AsyncStorage.getItem('@fitmate_device_id');
      if (!storedDeviceId) {
        storedDeviceId = 'dev-' + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('@fitmate_device_id', storedDeviceId);
      }
      deviceId = storedDeviceId;

      // 2. Get session token as simulated session ID
      const token = await AsyncStorage.getItem('@fitmate_token');
      if (token) {
        sessionId = token.substring(token.length - 15); // Show last 15 chars safely
      }

      // 3. Last sync status
      const syncQueue = await syncService.getQueue();
      const failedQueue = await syncService.getFailedRequests();
      lastSync = `Queue: ${syncQueue.length} pending, ${failedQueue.length} failed`;

      // 4. Hit health endpoint to calculate latency and check DB/AI status
      const health: any = await apiClient.get('/health');
      latency = Date.now() - start;
      if (health && health.status === 'ok') {
        apiStatus = 'Online (Healthy)';
        aiStatus = `Gemini: ${health.components?.aiProviders?.gemini || 'missing'}, OpenAI: ${health.components?.aiProviders?.openai || 'missing'}`;
        provider = health.components?.aiProviders?.gemini === 'configured' ? 'Google Gemini' : 'OpenAI';
        cacheStats = `Hit Ratio: ${Math.round((health.components?.metrics?.cacheHitRatio || 1.0) * 100)}%`;
      }
    } catch (err: any) {
      latency = Date.now() - start;
      console.log('Diagnostics check failed', err);
    } finally {
      setDiagnostics({
        apiStatus,
        aiStatus,
        provider,
        cacheStats,
        version: '1.0.0 (Beta)',
        environment: __DEV__ ? 'development' : 'production',
        lastSync,
        latency,
        deviceId,
        sessionId,
      });
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const logString = JSON.stringify({
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      ...diagnostics
    }, null, 2);

    try {
      await Share.share({
        message: logString,
        title: 'FitMate Diagnostics Export',
      });
    } catch (err) {
      console.error('Failed to export logs', err);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Diagnostics"
        showBackButton={true}
        onBackButtonPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Ionicons name="pulse" size={48} color={diagnostics.apiStatus.includes('Online') ? colors.success : colors.error} />
          <Text style={styles.statusTitle}>
            System is {diagnostics.apiStatus.includes('Online') ? 'Online' : 'Offline'}
          </Text>
          <Text style={styles.statusSubtitle}>Ping Latency: {diagnostics.latency}ms</Text>
        </View>

        <Text style={styles.groupTitle}>Connection Details</Text>
        <Card variant="solid" style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>API Status</Text>
            <Text style={styles.infoValue}>{diagnostics.apiStatus}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Config Status</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{diagnostics.aiStatus}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Provider</Text>
            <Text style={styles.infoValue}>{diagnostics.provider}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prompt Cache Ratio</Text>
            <Text style={styles.infoValue}>{diagnostics.cacheStats}</Text>
          </View>
        </Card>

        <Text style={styles.groupTitle}>Device & Session</Text>
        <Card variant="solid" style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device ID</Text>
            <Text style={[styles.infoValue, styles.codeText]}>{diagnostics.deviceId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Session ID Token</Text>
            <Text style={[styles.infoValue, styles.codeText]}>{diagnostics.sessionId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sync Status</Text>
            <Text style={styles.infoValue}>{diagnostics.lastSync}</Text>
          </View>
        </Card>

        <Text style={styles.groupTitle}>Application Config</Text>
        <Card variant="solid" style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>{diagnostics.version}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Environment</Text>
            <Text style={styles.infoValue}>{diagnostics.environment}</Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={runDiagnostics} 
            style={[styles.btn, styles.btnSecondary, loading && styles.btnDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onSurface} size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={colors.onSurface} style={{ marginRight: 6 }} />
                <Text style={styles.btnText}>Retry Tests</Text>
              </>
            )}
          </Pressable>

          <Pressable 
            onPress={handleExport} 
            style={[styles.btn, styles.btnPrimary]}
          >
            <Ionicons name="share-social" size={16} color={colors.onBrandPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.btnText, { color: colors.onBrandPrimary }]}>Export Diagnostic Logs</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  headerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
  },
  infoValue: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: spacing.md,
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  bottomSpacer: {
    height: 40,
  },
});
