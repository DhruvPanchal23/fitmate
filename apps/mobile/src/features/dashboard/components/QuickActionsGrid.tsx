import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface QuickActionsGridProps {
  actions: readonly ActionItem[];
  onActionPress: (id: string) => void;
}

export const QuickActionsGrid = React.memo(({ actions, onActionPress }: QuickActionsGridProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsContainer}
      >
        {actions.map((action) => (
          <Card
            key={action.id}
            variant="solid"
            onPress={() => onActionPress(action.id)}
            style={styles.actionCard}
          >
            <View style={[styles.iconBox, { backgroundColor: `${action.color}20` }]}>
              <Ionicons name={action.icon as any} size={22} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  quickActionsContainer: {
    paddingRight: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  actionCard: {
    width: 104,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: 0,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
  },
});

export default QuickActionsGrid;
