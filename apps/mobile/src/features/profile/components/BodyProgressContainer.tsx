import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useProfile } from '../../../hooks/use-profile';
import Toast from 'react-native-toast-message';

export function BodyProgressContainer() {
  const {
    bodyMeasurements,
    weightProgress,
    bodyFatProgress,
    measurementsProgress,
    isRefetching,
    reloadAll,
    logMeasurement,
    isLoggingMeasurement,
  } = useProfile();

  const [activeMetric, setActiveMetric] = useState<'weight' | 'bodyFat' | 'waist'>('weight');

  // Input states
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    if (!weight) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Weight is required to log a measurement.',
      });
      return;
    }
    const weightVal = parseFloat(weight);
    if (weightVal < 20 || weightVal > 400) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Weight',
        text2: 'Weight must be between 20 and 400 kg.',
      });
      return;
    }

    logMeasurement(
      {
        weight: weightVal,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        notes: notes || undefined,
        source: 'USER',
      },
      {
        onSuccess: () => {
          setWeight('');
          setBodyFat('');
          setWaist('');
          setNotes('');
        },
      }
    );
  };

  const currentProgress =
    activeMetric === 'weight'
      ? weightProgress
      : activeMetric === 'bodyFat'
      ? bodyFatProgress
      : measurementsProgress?.waist;

  // Custom visual sparkline bar chart using native views
  const renderChart = () => {
    if (!currentProgress || !currentProgress.points || currentProgress.points.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Not enough data to render trend. Add measurements!</Text>
        </View>
      );
    }

    const points = currentProgress.points;
    const values = points.map((p) => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{currentProgress.metric} History</Text>
          <Text style={styles.chartRangeText}>
            Min: {min} • Max: {max} {currentProgress.unit}
          </Text>
        </View>

        {/* Sparkbars */}
        <View style={styles.sparkRow}>
          {points.map((p, idx) => {
            // Calculate height as percentage between min and max (or relative scale)
            const heightPct = range > 0 ? ((p.value - min) / range) * 80 + 20 : 60;
            return (
              <View key={idx} style={styles.sparkColumn}>
                <View style={styles.barWrapper}>
                  <View style={[styles.sparkBar, { height: `${heightPct}%` }]} />
                </View>
                <Text style={styles.barLabel}>{p.date.split('-')[2]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader title="Body Progress" subtitle="Log measurements & follow trends" />

      {/* Tab Switcher */}
      <View style={styles.tabBarContainer}>
        <Pressable
          style={[styles.tabButton, activeMetric === 'weight' && styles.activeTabButton]}
          onPress={() => setActiveMetric('weight')}
        >
          <Text style={[styles.tabLabel, activeMetric === 'weight' && styles.activeTabLabel]}>Weight</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeMetric === 'bodyFat' && styles.activeTabButton]}
          onPress={() => setActiveMetric('bodyFat')}
        >
          <Text style={[styles.tabLabel, activeMetric === 'bodyFat' && styles.activeTabLabel]}>Body Fat</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeMetric === 'waist' && styles.activeTabButton]}
          onPress={() => setActiveMetric('waist')}
        >
          <Text style={[styles.tabLabel, activeMetric === 'waist' && styles.activeTabLabel]}>Waist</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reloadAll}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* Trend Graph */}
        <Card variant="glass" style={styles.trendCard}>
          {renderChart()}

          {currentProgress?.trend && (
            <View style={styles.trendGrid}>
              <View style={styles.trendBox}>
                <Text style={[styles.trendVal, currentProgress.trend.weeklyChange > 0 ? styles.gainText : styles.lossText]}>
                  {currentProgress.trend.weeklyChange > 0 ? '+' : ''}
                  {currentProgress.trend.weeklyChange} {currentProgress.unit}
                </Text>
                <Text style={styles.trendLabel}>Weekly Change</Text>
              </View>
              <View style={styles.trendBox}>
                <Text style={styles.trendVal}>
                  {currentProgress.trend.rollingAverage} {currentProgress.unit}
                </Text>
                <Text style={styles.trendLabel}>Rolling Average</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Input Card */}
        <Card variant="solid" style={styles.inputCard}>
          <Text style={styles.inputSectionTitle}>Log Progress</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>Weight (kg/lbs)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 73.2"
                placeholderTextColor={colors.onSurfaceSecondary}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>Body Fat (%)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder="e.g. 14.5"
                placeholderTextColor={colors.onSurfaceSecondary}
              />
            </View>
          </View>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>Waist (cm/in)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={waist}
                onChangeText={setWaist}
                placeholder="e.g. 82"
                placeholderTextColor={colors.onSurfaceSecondary}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>Notes</Text>
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. morning log"
                placeholderTextColor={colors.onSurfaceSecondary}
              />
            </View>
          </View>
          <Button
            title="Submit Measurement Log"
            onPress={handleLog}
            loading={isLoggingMeasurement}
            style={styles.submitButton}
          />
        </Card>

        {/* History List */}
        <Text style={styles.historyHeader}>Log History</Text>
        {bodyMeasurements.length === 0 ? (
          <Text style={styles.noHistoryText}>No records logged yet.</Text>
        ) : (
          bodyMeasurements.map((item) => (
            <Card key={item.id} variant="solid" style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={styles.historySource}>Source: {item.source}</Text>
                </View>
                <View style={styles.historyValues}>
                  <Text style={styles.historyMainVal}>{item.weight} kg</Text>
                  <Text style={styles.historySubVal}>
                    {item.bodyFat ? `BF: ${item.bodyFat}%` : ''}
                    {item.bodyFat && item.waist ? ' • ' : ''}
                    {item.waist ? `Waist: ${item.waist} cm` : ''}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  activeTabButton: {
    backgroundColor: colors.surface,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
  },
  activeTabLabel: {
    color: colors.brand,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  trendCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    height: 160,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  chartRangeText: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingTop: spacing.xs,
  },
  sparkColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  barLabel: {
    fontSize: 8,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  trendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  trendBox: {
    alignItems: 'center',
  },
  trendVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  gainText: {
    color: colors.success,
  },
  lossText: {
    color: colors.brand,
  },
  trendLabel: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  inputCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  inputBox: {
    flex: 1,
  },
  inputBoxLabel: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.onSurface,
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  historyHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginVertical: spacing.md,
  },
  noHistoryText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  historyCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
  historySource: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  historyValues: {
    alignItems: 'flex-end',
  },
  historyMainVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  historySubVal: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});

export default BodyProgressContainer;
