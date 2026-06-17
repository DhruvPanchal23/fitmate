import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface MealItem {
  foodName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

interface MealLog {
  id: string;
  mealType: string;
  createdAt: string | Date;
  items: MealItem[];
}

interface LoggedMealsListProps {
  meals: MealLog[];
  onAddFoodPress: () => void;
}

export const LoggedMealsList = React.memo(({ meals, onAddFoodPress }: LoggedMealsListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.mealsHeaderRow}>
        <Text style={styles.sectionTitle}>Logged Meals</Text>
        <Pressable onPress={onAddFoodPress}>
          <Text style={styles.viewAllLink}>Add Food</Text>
        </Pressable>
      </View>

      {meals.length === 0 ? (
        <Card variant="solid" style={styles.emptyCard}>
          <Ionicons name="restaurant-outline" size={32} color={colors.onSurfaceSecondary} />
          <Text style={styles.emptyText}>No meals logged yet today.</Text>
          <Text style={styles.emptySubtext}>Use the Scan Meal action or chat with your AI Coach to log your first entry!</Text>
        </Card>
      ) : (
        meals.map((item) => {
          const totalCalories = item.items ? Math.round(item.items.reduce((sum, i) => sum + i.calories, 0)) : 0;
          const totalProtein = item.items ? Math.round(item.items.reduce((sum, i) => sum + i.protein, 0)) : 0;
          const totalCarbs = item.items ? Math.round(item.items.reduce((sum, i) => sum + i.carbohydrates, 0)) : 0;
          const totalFats = item.items ? Math.round(item.items.reduce((sum, i) => sum + i.fats, 0)) : 0;

          return (
            <Card key={item.id} variant="solid" style={styles.mealCard}>
              <View style={styles.mealRow}>
                <View style={styles.mealLeft}>
                  <View style={styles.mealIconContainer}>
                    <Ionicons
                      name={
                        item.mealType === 'Breakfast'
                          ? 'cafe'
                          : item.mealType === 'Lunch'
                          ? 'nutrition'
                          : 'fast-food'
                      }
                      size={20}
                      color={colors.brand}
                    />
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName} numberOfLines={1}>
                      {item.items && item.items.length > 0
                        ? item.items.map((i) => i.foodName).join(', ')
                        : 'Unknown Meal'}
                    </Text>
                    <Text style={styles.mealTime}>
                      {item.mealType} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealCalories}>{totalCalories} kcal</Text>
                  <Text style={styles.mealMacros}>
                    P: {totalProtein}g • C: {totalCarbs}g • F: {totalFats}g
                  </Text>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  mealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  viewAllLink: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '600',
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  mealCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  mealIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.brand}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  mealTime: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  mealRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  mealMacros: {
    fontSize: 10,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
});

export default LoggedMealsList;
