import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { MacroProgress } from '../../../components/MacroProgress';
import { useDashboard } from '../../../hooks/use-dashboard';
import { SkeletonDashboard } from '../../../components/LoadingState';
import Toast from 'react-native-toast-message';

export function DashboardContainer() {
  const {
    meals,
    water,
    calories,
    protein,
    carbs,
    fat,
    loading,
    isRefetching,
    handleQuickAction,
    QUICK_ACTIONS,
    reloadData,
  } = useDashboard();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Hello, Dhruv"
        subtitle="Make today a healthy day!"
        showAvatar
      />
      
      {loading ? (
        <SkeletonDashboard />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={reloadData}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        >
          {/* Macro Progress Ring Card */}
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

          {/* Quick Actions Title */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {/* Quick Actions Scroll Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {QUICK_ACTIONS.map((action) => (
              <Card
                key={action.id}
                variant="solid"
                onPress={() => handleQuickAction(action.id)}
                style={styles.actionCard}
              >
                <View style={[styles.iconBox, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Card>
            ))}
          </ScrollView>

          {/* Logged Meals List */}
          <View style={styles.mealsHeaderRow}>
            <Text style={styles.sectionTitle}>Logged Meals</Text>
            <Pressable onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Custom Logging',
                text2: 'Use Scanner or AI Coach for quick logging.',
              });
            }}>
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
            meals.map((item) => (
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
                      <Text style={styles.mealName}>
                        {item.items && item.items.length > 0
                          ? item.items.map((i: any) => i.foodName).join(', ')
                          : 'Unknown Meal'}
                      </Text>
                      <Text style={styles.mealTime}>
                        {item.mealType} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.mealRight}>
                    <Text style={styles.mealCalories}>
                      {item.items ? Math.round(item.items.reduce((sum: number, i: any) => sum + i.calories, 0)) : 0} kcal
                    </Text>
                    <Text style={styles.mealMacros}>
                      P: {item.items ? Math.round(item.items.reduce((sum: number, i: any) => sum + i.protein, 0)) : 0}g • C: {item.items ? Math.round(item.items.reduce((sum: number, i: any) => sum + i.carbohydrates, 0)) : 0}g • F: {item.items ? Math.round(item.items.reduce((sum: number, i: any) => sum + i.fats, 0)) : 0}g
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
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
  macroCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
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
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
  },
  mealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAllLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  mealCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
  },
  mealIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  mealTime: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  mealMacros: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});
export default DashboardContainer;
