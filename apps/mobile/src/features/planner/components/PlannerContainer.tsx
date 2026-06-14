import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useMealPlanner } from '../../../hooks/use-meal-planner';
import Toast from 'react-native-toast-message';

export function PlannerContainer() {
  const {
    allPlans,
    activePlan,
    analytics,
    loading,
    isRefetching,
    generatePlan,
    activatePlan,
    deletePlan,
    completeMeal,
    skipMeal,
    regenerate,
    saveTemplate,
    reloadData,
  } = useMealPlanner();

  const [activeTab, setActiveTab] = useState<'plan' | 'list' | 'shopping'>('plan');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [loadingShopping, setLoadingShopping] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('My Personalized Plan');
  const [formType, setFormType] = useState<'daily' | 'weekly'>('daily');
  const [formGoal, setFormGoal] = useState<'maintenance' | 'fat_loss' | 'muscle_gain'>('maintenance');
  const [formPreference, setFormPreference] = useState<'none' | 'vegetarian' | 'vegan' | 'high_protein'>('none');
  const [allergiesText, setAllergiesText] = useState('');
  const [budgetPref, setBudgetPref] = useState<'low' | 'medium' | 'high'>('medium');

  const handleGenerate = () => {
    const allergies = allergiesText
      ? allergiesText.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    generatePlan.mutate(
      {
        title: formTitle,
        type: formType,
        goal: formGoal,
        dietaryPreference: formPreference,
        allergies,
        budgetPreference: budgetPref,
      },
      {
        onSuccess: () => {
          setShowGenerateModal(false);
          setActiveTab('plan');
        },
      }
    );
  };

  const handleFetchShoppingList = async (planId: string) => {
    setLoadingShopping(true);
    setShowShoppingModal(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/meal-planner/shopping-list/${planId}`, {
        headers: {
          'Content-Type': 'application/type',
        },
      });
      const data = await response.json();
      setShoppingList(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch shopping list',
      });
    } finally {
      setLoadingShopping(false);
    }
  };

  const currentDay = activePlan?.days?.[selectedDayIndex] || null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="Meal Planner"
        subtitle="AI-guided meal schedules & recipes"
      />

      {/* Tabs */}
      <View style={styles.tabBarContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'plan' && styles.activeTabButton]}
          onPress={() => setActiveTab('plan')}
        >
          <Text style={[styles.tabLabel, activeTab === 'plan' && styles.activeTabLabel]}>Active Plan</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'list' && styles.activeTabButton]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabLabel, activeTab === 'list' && styles.activeTabLabel]}>Saved Plans</Text>
        </Pressable>
      </View>

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
        {activeTab === 'plan' && (
          <>
            {activePlan ? (
              <View>
                {/* Active Plan Summary */}
                <Card variant="glass" style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View>
                      <Text style={styles.planTitle}>{activePlan.title}</Text>
                      <Text style={styles.planType}>
                        {activePlan.type === 'weekly' ? 'Weekly Schedule' : 'Daily Schedule'} • Goal: {activePlan.goal}
                      </Text>
                    </View>
                    <View style={styles.versionBadge}>
                      <Text style={styles.versionText}>v{activePlan.version}</Text>
                    </View>
                  </View>

                  <View style={styles.macroGrid}>
                    <View style={styles.macroBox}>
                      <Text style={styles.macroVal}>{activePlan.caloriesTarget}</Text>
                      <Text style={styles.macroLabel}>Calories</Text>
                    </View>
                    <View style={styles.macroBox}>
                      <Text style={styles.macroVal}>{activePlan.proteinTarget}g</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroBox}>
                      <Text style={styles.macroVal}>{activePlan.carbsTarget}g</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroBox}>
                      <Text style={styles.macroVal}>{activePlan.fatTarget}g</Text>
                      <Text style={styles.macroLabel}>Fats</Text>
                    </View>
                  </View>

                  <View style={styles.summaryFooter}>
                    <Button
                      title="Shopping List"
                      onPress={() => handleFetchShoppingList(activePlan.id)}
                      variant="outline"
                      size="sm"
                      style={styles.footerButton}
                    />
                    <Button
                      title="Save as Template"
                      onPress={() => saveTemplate.mutate({ planId: activePlan.id, title: activePlan.title })}
                      variant="glass"
                      size="sm"
                      style={styles.footerButton}
                    />
                  </View>
                </Card>

                {/* Day Selector (only for weekly plans) */}
                {activePlan.type === 'weekly' && activePlan.days.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.daySelectorContainer}
                  >
                    {activePlan.days.map((day: any, idx: number) => (
                      <Pressable
                        key={day.id}
                        style={[
                          styles.dayChip,
                          selectedDayIndex === idx && styles.dayChipActive,
                        ]}
                        onPress={() => setSelectedDayIndex(idx)}
                      >
                        <Text
                          style={[
                            styles.dayChipText,
                            selectedDayIndex === idx && styles.dayChipTextActive,
                          ]}
                        >
                          {day.dayOfWeek}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}

                {/* Day Macro Summary */}
                {currentDay && (
                  <View style={styles.dayMacroBar}>
                    <Text style={styles.dayMacroText}>
                      Day Total: {currentDay.calories} kcal • P: {currentDay.protein}g • C: {currentDay.carbs}g • F: {currentDay.fats}g
                    </Text>
                  </View>
                )}

                {/* Meals List */}
                {currentDay && currentDay.meals.length > 0 ? (
                  currentDay.meals.map((meal: any) => {
                    const isPlanned = meal.status === 'planned';
                    let statusColor: string = colors.info;
                    if (meal.status === 'completed') statusColor = colors.success;
                    if (meal.status === 'skipped') statusColor = colors.onSurfaceSecondary;
                    if (meal.status === 'replaced') statusColor = colors.warning;

                    return (
                      <Card key={meal.id} variant="solid" style={styles.mealCard}>
                        <View style={styles.mealHeader}>
                          <View style={styles.mealTypeRow}>
                            <Ionicons name="restaurant-outline" size={16} color={colors.brand} />
                            <Text style={styles.mealTypeLabel}>{meal.mealType}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{meal.status}</Text>
                          </View>
                        </View>

                        <Text style={styles.foodName}>{meal.foodName}</Text>
                        <Text style={styles.foodQty}>
                          Quantity: {meal.quantity} {meal.unit}
                        </Text>

                        <View style={styles.mealMacrosLine}>
                          <Text style={styles.mealMacrosText}>
                            {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                          </Text>
                        </View>

                        {isPlanned && (
                          <View style={styles.actionButtonsRow}>
                            <Button
                              title="Complete"
                              onPress={() => completeMeal.mutate(meal.id)}
                              variant="primary"
                              size="sm"
                              style={styles.actionBtn}
                            />
                            <Button
                              title="Skip"
                              onPress={() => skipMeal.mutate(meal.id)}
                              variant="glass"
                              size="sm"
                              style={styles.actionBtn}
                            />
                            <Button
                              title="Regen"
                              onPress={() => regenerate.mutate({ planId: activePlan.id, mealId: meal.id })}
                              variant="outline"
                              size="sm"
                              style={styles.actionBtn}
                            />
                          </View>
                        )}
                      </Card>
                    );
                  })
                ) : (
                  <View style={styles.emptyDayContainer}>
                    <Text style={styles.emptyDayText}>No meals generated for this day.</Text>
                  </View>
                )}
              </View>
            ) : (
              <Card variant="solid" style={styles.emptyPlanCard}>
                <Ionicons name="sparkles" size={48} color={colors.brand} />
                <Text style={styles.emptyPlanTitle}>No Active Meal Plan</Text>
                <Text style={styles.emptyPlanSubtitle}>
                  Let AI design a healthy, tailored eating schedule fits your fitness goals, budget, and dietary preferences.
                </Text>
                <Button
                  title="Generate AI Meal Plan"
                  onPress={() => setShowGenerateModal(true)}
                  style={styles.generateButton}
                />
              </Card>
            )}
          </>
        )}

        {activeTab === 'list' && (
          <View>
            <Button
              title="Generate New Plan"
              onPress={() => setShowGenerateModal(true)}
              style={styles.listGenerateButton}
            />

            <Text style={styles.sectionTitle}>History & Drafts</Text>
            {allPlans.length === 0 ? (
              <Text style={styles.noPlansText}>No plans generated yet.</Text>
            ) : (
              allPlans.map((plan: any) => (
                <Card key={plan.id} variant="solid" style={styles.historyPlanCard}>
                  <View style={styles.historyPlanHeader}>
                    <View>
                      <Text style={styles.historyPlanTitle}>{plan.title}</Text>
                      <Text style={styles.historyPlanSub}>
                        {plan.type === 'weekly' ? 'Weekly' : 'Daily'} • Version: {plan.version}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            plan.status === 'active'
                              ? `${colors.success}20`
                              : plan.status === 'draft'
                              ? `${colors.warning}20`
                              : `${colors.onSurfaceSecondary}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              plan.status === 'active'
                                ? colors.success
                                : plan.status === 'draft'
                                ? colors.warning
                                : colors.onSurfaceSecondary,
                          },
                        ]}
                      >
                        {plan.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyPlanStats}>
                    <Text style={styles.historyPlanStatsText}>
                      Target: {plan.caloriesTarget} kcal • P: {plan.proteinTarget}g • C: {plan.carbsTarget}g • F: {plan.fatTarget}g
                    </Text>
                  </View>

                  <View style={styles.historyPlanActions}>
                    {plan.status !== 'active' && (
                      <Button
                        title="Activate"
                        onPress={() => activatePlan.mutate(plan.id)}
                        variant="primary"
                        size="sm"
                        style={styles.historyActionBtn}
                      />
                    )}
                    <Button
                      title="Delete"
                      onPress={() => deletePlan.mutate(plan.id)}
                      variant="danger"
                      size="sm"
                      style={styles.historyActionBtn}
                    />
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Generate Meal Plan Modal */}
      <Modal visible={showGenerateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Plan Generator</Text>
              <Pressable onPress={() => setShowGenerateModal(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormScroll}>
              <Text style={styles.formLabel}>Plan Title</Text>
              <TextInput
                style={styles.formInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="My Plan"
                placeholderTextColor={colors.onSurfaceSecondary}
              />

              <Text style={styles.formLabel}>Plan Duration</Text>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleBtn, formType === 'daily' && styles.toggleBtnActive]}
                  onPress={() => setFormType('daily')}
                >
                  <Text style={[styles.toggleText, formType === 'daily' && styles.toggleTextActive]}>Daily</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, formType === 'weekly' && styles.toggleBtnActive]}
                  onPress={() => setFormType('weekly')}
                >
                  <Text style={[styles.toggleText, formType === 'weekly' && styles.toggleTextActive]}>Weekly</Text>
                </Pressable>
              </View>

              <Text style={styles.formLabel}>Fitness Goal</Text>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleBtn, formGoal === 'maintenance' && styles.toggleBtnActive]}
                  onPress={() => setFormGoal('maintenance')}
                >
                  <Text style={[styles.toggleText, formGoal === 'maintenance' && styles.toggleTextActive]}>Maintenance</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, formGoal === 'fat_loss' && styles.toggleBtnActive]}
                  onPress={() => setFormGoal('fat_loss')}
                >
                  <Text style={[styles.toggleText, formGoal === 'fat_loss' && styles.toggleTextActive]}>Fat Loss</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, formGoal === 'muscle_gain' && styles.toggleBtnActive]}
                  onPress={() => setFormGoal('muscle_gain')}
                >
                  <Text style={[styles.toggleText, formGoal === 'muscle_gain' && styles.toggleTextActive]}>Muscle Gain</Text>
                </Pressable>
              </View>

              <Text style={styles.formLabel}>Dietary Preference</Text>
              <View style={styles.toggleRowMulti}>
                {['none', 'vegetarian', 'vegan', 'high_protein'].map((pref) => (
                  <Pressable
                    key={pref}
                    style={[styles.toggleBtnSmall, formPreference === pref && styles.toggleBtnActive]}
                    onPress={() => setFormPreference(pref as any)}
                  >
                    <Text style={[styles.toggleTextSmall, formPreference === pref && styles.toggleTextActive]}>
                      {pref.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.formLabel}>Allergies (comma-separated)</Text>
              <TextInput
                style={styles.formInput}
                value={allergiesText}
                onChangeText={setAllergiesText}
                placeholder="e.g. peanuts, dairy"
                placeholderTextColor={colors.onSurfaceSecondary}
              />

              <Text style={styles.formLabel}>Budget Preference</Text>
              <View style={styles.toggleRow}>
                {['low', 'medium', 'high'].map((budget) => (
                  <Pressable
                    key={budget}
                    style={[styles.toggleBtn, budgetPref === budget && styles.toggleBtnActive]}
                    onPress={() => setBudgetPref(budget as any)}
                  >
                    <Text style={[styles.toggleText, budgetPref === budget && styles.toggleTextActive]}>
                      {budget}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Button
                title="Create with AI Coach"
                onPress={handleGenerate}
                loading={generatePlan.isPending}
                style={styles.modalSubmitButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Shopping List Modal */}
      <Modal visible={showShoppingModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aggregated Shopping List</Text>
              <Pressable onPress={() => setShowShoppingModal(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </Pressable>
            </View>

            {loadingShopping ? (
              <View style={styles.modalLoader}>
                <ActivityIndicator size="large" color={colors.brand} />
                <Text style={styles.loadingText}>Compiling shopping list...</Text>
              </View>
            ) : shoppingList?.categories ? (
              <ScrollView contentContainerStyle={styles.shoppingScroll}>
                <Text style={styles.shoppingCost}>
                  Estimated Total Cost: {shoppingList.currency} {shoppingList.totalCost}
                </Text>
                {Object.keys(shoppingList.categories).map((catName) => (
                  <View key={catName} style={styles.categoryBlock}>
                    <Text style={styles.categoryHeader}>{catName}</Text>
                    {shoppingList.categories[catName].map((item: any) => (
                      <View key={item.id} style={styles.shoppingItemRow}>
                        <Ionicons name="cart-outline" size={18} color={colors.brand} style={styles.cartIcon} />
                        <View style={styles.shoppingItemInfo}>
                          <Text style={styles.shoppingItemName}>{item.name}</Text>
                          <Text style={styles.shoppingItemQty}>
                            {item.quantity} {item.unit}
                          </Text>
                        </View>
                        {item.pantryDeduction > 0 && (
                          <View style={styles.pantryCoverBadge}>
                            <Text style={styles.pantryCoverText}>Pantry covered</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.modalLoader}>
                <Text style={styles.noDataText}>No items found in shopping list.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  planType: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  macroBox: {
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  macroLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  summaryFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  daySelectorContainer: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  dayChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  dayChipText: {
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  dayMacroBar: {
    backgroundColor: colors.surfaceTertiary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  dayMacroText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  mealCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2,
  },
  foodQty: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
  },
  mealMacrosLine: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  mealMacrosText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyDayText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
  },
  emptyPlanCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  emptyPlanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  emptyPlanSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  generateButton: {
    marginTop: spacing.sm,
  },
  listGenerateButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  noPlansText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  historyPlanCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  historyPlanSub: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  historyPlanStats: {
    marginTop: spacing.sm,
  },
  historyPlanStatsText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
  },
  historyPlanActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  historyActionBtn: {
    flex: 1,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  modalFormScroll: {
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleRowMulti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  toggleBtnSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: colors.brand,
    backgroundColor: `${colors.brand}10`,
  },
  toggleText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    fontWeight: '600',
  },
  toggleTextSmall: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.brand,
  },
  modalSubmitButton: {
    marginTop: spacing.md,
  },
  modalLoader: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
  },
  shoppingScroll: {
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  shoppingCost: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: spacing.sm,
  },
  categoryBlock: {
    marginBottom: spacing.md,
  },
  categoryHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  shoppingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  cartIcon: {
    marginRight: spacing.sm,
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  shoppingItemQty: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  pantryCoverBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pantryCoverText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
  },
});

export default PlannerContainer;
