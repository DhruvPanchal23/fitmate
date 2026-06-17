import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { MacroProgress } from '../../../components/MacroProgress';

interface MacroProgressCardProps {
  calories: any;
  protein: any;
  carbs: any;
  fat: any;
  water: any;
}

export const MacroProgressCard = React.memo(({ calories, protein, carbs, fat, water }: MacroProgressCardProps) => {
  return (
    <Card variant="glass" style={styles.macroCard}>
      <Text style={styles.sectionHeader}>Daily Summary</Text>
      <MacroProgress
        calories={calories}
        protein={protein}
        carbs={carbs}
        fat={fat}
        water={water}
      />
    </Card>
  );
});

const styles = StyleSheet.create({
  macroCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
});

export default MacroProgressCard;
