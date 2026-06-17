import React from 'react';
import { StyleSheet, FlatList, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../hooks/use-notifications';
import { HabitCard } from '../components/HabitCard';
import { HabitProgressCard } from '../components/HabitProgressCard';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export function HabitScreen() {
  const { habits, habitAnalytics, isRefetching, reloadData } = useNotifications();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Habit Tracker"
        subtitle="Track your daily routines and build healthy streaks"
      />

      <FlatList
        data={habits || []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          habitAnalytics ? <HabitProgressCard analytics={habitAnalytics} /> : null
        }
        renderItem={({ item }) => <HabitCard habit={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={reloadData}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
});

export default HabitScreen;
