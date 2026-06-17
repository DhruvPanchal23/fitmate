import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../hooks/use-notifications';
import { ReminderCard } from '../components/ReminderCard';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export function ReminderSettingsScreen() {
  const { reminders, isRefetching, updateReminder, reloadData } = useNotifications();

  const handleUpdateReminder = async (data: { id: string; enabled?: boolean; time?: string; days?: number[]; smart?: boolean }) => {
    await updateReminder(data);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Reminder Settings"
        subtitle="Manage your smart habit alerts and schedules"
      />

      <FlatList
        data={reminders || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard reminder={item} onUpdate={handleUpdateReminder} />
        )}
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

export default ReminderSettingsScreen;
