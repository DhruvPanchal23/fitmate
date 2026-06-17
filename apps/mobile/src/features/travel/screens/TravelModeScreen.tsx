import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/colors';
import { useTravel } from '../../../hooks/use-travel';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ScreenHeader } from '../../../components/ScreenHeader';

export default function TravelModeScreen() {
  const router = useRouter();
  const {
    activeSession,
    loading,
    isRefetching,
    startTravel,
    isStarting,
    endTravel,
    isEnding,
    recovery,
    refetchAll,
  } = useTravel();

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('vacation'); // vacation | business | family | other
  const [timezone, setTimezone] = useState('');

  const handleStartTravel = async () => {
    try {
      await startTravel({
        destination: destination || 'Unknown',
        purpose,
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setDestination('');
    } catch (e) {
      // toast shown in hook
    }
  };

  const handleEndTravel = async () => {
    try {
      await endTravel();
      // Redirect to recovery plan screen
      router.push('/travel/recovery' as any);
    } catch (e) {
      // toast shown in hook
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Travel Mode"
        subtitle="Enjoy your trip, track calorie deviations safely"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchAll}
            tintColor={colors.brand}
          />
        }
      >
        {activeSession ? (
          // ACTIVE TRAVEL VIEW
          <View style={styles.activeContainer}>
            <Card style={styles.activeCard}>
              <View style={styles.headerRow}>
                <Ionicons name="airplane" size={32} color={colors.brand} />
                <View style={styles.headerTextCol}>
                  <Text style={styles.activeTitle}>Active Trip</Text>
                  <Text style={styles.activeSubtitle}>
                    {activeSession.destination || 'Roaming'} ({activeSession.purpose})
                  </Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Current Surplus</Text>
                  <Text style={[styles.statValue, styles.surplusText]}>
                    +{activeSession.liveSurplus || 0} kcal
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Days Traveling</Text>
                  <Text style={styles.statValue}>
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date().getTime() - new Date(activeSession.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.tipText}>
                <Ionicons name="information-circle-outline" size={14} color={colors.onSurfaceSecondary} />
                {'  '}
                Enjoy your eating! FitMate is keeping track of your surplus so we can make a safe recovery plan when you get back.
              </Text>
            </Card>

            <Button
              title="End Travel & Generate Recovery Plan"
              onPress={handleEndTravel}
              loading={isEnding}
              variant="primary"
              style={styles.endButton}
            />
          </View>
        ) : (
          // START TRAVEL FORM
          <View style={styles.formContainer}>
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Where are you going?</Text>

              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Hawaii, Tokyo, Paris"
                placeholderTextColor={colors.onSurfaceTertiary}
                value={destination}
                onChangeText={setDestination}
              />

              <Text style={styles.inputLabel}>Purpose of Trip</Text>
              <View style={styles.purposeContainer}>
                {['vacation', 'business', 'family', 'other'].map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.purposeButton,
                      purpose === item && styles.purposeButtonActive,
                    ]}
                    onPress={() => setPurpose(item)}
                  >
                    <Text
                      style={[
                        styles.purposeText,
                        purpose === item && styles.purposeTextActive,
                      ]}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Timezone (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. America/New_York (optional)"
                placeholderTextColor={colors.onSurfaceTertiary}
                value={timezone}
                onChangeText={setTimezone}
              />

              <Button
                title="Enable Travel Mode"
                onPress={handleStartTravel}
                loading={isStarting}
                style={styles.startButton}
              />
            </Card>

            {recovery && (
              <Card
                style={styles.recoveryCard}
                onPress={() => router.push('/travel/recovery' as any)}
              >
                <View style={styles.recoveryHeader}>
                  <Ionicons name="fitness-outline" size={24} color={colors.brandSecondary} />
                  <Text style={styles.recoveryTitle}>Active Recovery Plan</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
                </View>
                <Text style={styles.recoveryText}>
                  You have an active recovery plan (Day {recovery.currentDayNumber} of {recovery.plan.recoveryDays}). View details and workout suggestions.
                </Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  activeContainer: {
    flex: 1,
  },
  activeCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  activeSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 6,
  },
  surplusText: {
    color: colors.warning,
  },
  tipText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    lineHeight: 18,
  },
  endButton: {
    backgroundColor: colors.error,
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  purposeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  purposeButton: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: colors.surfaceTertiary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    margin: 4,
    alignItems: 'center',
  },
  purposeButtonActive: {
    borderColor: colors.brand,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  purposeText: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  purposeTextActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  startButton: {
    marginTop: 24,
  },
  recoveryCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  recoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    flex: 1,
    marginLeft: 8,
  },
  recoveryText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    lineHeight: 20,
  },
});
