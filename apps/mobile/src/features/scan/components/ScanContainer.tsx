import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Image, Modal, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';
import { useScan } from '../../../hooks/use-scan';
import { nutritionService } from '../../../services/nutrition-service';
import { FoodResponse } from '../../../../../../shared/contracts';

export function ScanContainer() {
  const {
    scanState,
    imageUri,
    items,
    mealType,
    setMealType,
    totalMacros,
    handleCapture,
    handleUpload,
    handleRetake,
    handleRetry,
    handleUpdateQuantity,
    handleReplaceFood,
    handleRemoveItem,
    saveMeal,
  } = useScan();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodResponse[]>([]);
  const [searching, setSearching] = useState(false);

  const triggerSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await nutritionService.searchFoods(query);
      setSearchResults(results);
    } catch (e) {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const openSearch = (itemId: string) => {
    setActiveItemId(itemId);
    setSearchQuery('');
    setSearchResults([]);
    setSearchModalVisible(true);
  };

  const selectFood = (food: FoodResponse) => {
    if (activeItemId) {
      handleReplaceFood(activeItemId, food);
    }
    setSearchModalVisible(false);
    setActiveItemId(null);
  };

  const renderContent = () => {
    switch (scanState) {
      case 'idle':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderCornerTL} />
              <View style={styles.viewfinderCornerTR} />
              <View style={styles.viewfinderCornerBL} />
              <View style={styles.viewfinderCornerBR} />
              <Ionicons name="camera-outline" size={64} color={`${colors.brand}60`} />
              <Text style={styles.viewfinderText}>Align food inside frame</Text>
            </View>

            <Text style={styles.promptText}>Select a meal to scan:</Text>
            
            <View style={styles.optionsRow}>
              <Pressable
                style={styles.mockButton}
                onPress={() => handleCapture('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500')}
              >
                <Ionicons name="restaurant" size={20} color={colors.brand} />
                <Text style={styles.mockButtonLabel}>Salad & Chicken</Text>
              </Pressable>
              
              <Pressable
                style={styles.mockButton}
                onPress={() => handleCapture('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500')}
              >
                <Ionicons name="cafe" size={20} color={colors.brand} />
                <Text style={styles.mockButtonLabel}>Oatmeal Bowl</Text>
              </Pressable>
            </View>

            <Text style={styles.orText}>— OR —</Text>

            <Pressable
              style={[styles.primaryButton, { width: '80%' }]}
              onPress={() => handleCapture('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500')}
            >
              <Ionicons name="image-outline" size={20} color={colors.surface} />
              <Text style={styles.primaryButtonText}>Upload from Gallery</Text>
            </Pressable>
          </View>
        );

      case 'previewing':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.titleText}>Review Capture</Text>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}
            
            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={handleRetake}>
                <Ionicons name="refresh-outline" size={20} color={colors.onSurface} />
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </Pressable>
              
              <Pressable style={styles.primaryButton} onPress={handleUpload}>
                <Ionicons name="sparkles-outline" size={20} color={colors.surface} />
                <Text style={styles.primaryButtonText}>Analyze Meal</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'scanning':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.scannerAnimationContainer}>
              <View style={styles.radarSweep} />
              <Ionicons name="scan-outline" size={80} color={colors.brand} />
            </View>
            <ActivityIndicator size="large" color={colors.brand} style={styles.spinner} />
            <Text style={styles.loadingTitle}>Analyzing Image...</Text>
            <Text style={styles.loadingSub}>AI Coach is identifying food items and calculating quantities.</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={80} color={colors.warning} />
            <Text style={styles.loadingTitle}>Analysis Failed</Text>
            <Text style={styles.loadingSub}>Could not analyze image. Please try retaking a clearer photo.</Text>
            <Pressable style={styles.primaryButton} onPress={handleRetake}>
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </Pressable>
          </View>
        );

      case 'saving':
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingTitle}>Saving Meal...</Text>
            <Text style={styles.loadingSub}>Adding food entries to your daily nutritional database.</Text>
          </View>
        );

      case 'editing':
        return (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detectionHeader}>
              <Text style={styles.titleText}>📸 Meal Detected</Text>
              <Text style={styles.subtitleText}>Review and confirm detected foods before saving.</Text>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
            )}

            {/* Meal Type Selector */}
            <Card variant="solid" style={styles.selectorCard}>
              <Text style={styles.sectionHeader}>Meal Type</Text>
              <View style={styles.typeRow}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeOption,
                      mealType === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setMealType(type)}
                  >
                    <Text
                      style={[
                        styles.typeLabel,
                        mealType === type && styles.typeLabelSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            {/* Detected Items List */}
            <Text style={styles.sectionTitle}>Detected Foods</Text>
            {items.map((item) => (
              <Card key={item.id} variant="solid" style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.itemName}>{item.foodName}</Text>
                      <View style={[styles.badge, { backgroundColor: `${colors.brand}20` }]}>
                        <Text style={styles.badgeText}>{Math.round(item.confidence * 100)}%</Text>
                      </View>
                    </View>
                    <Text style={styles.itemMacros}>
                      {item.calories} kcal • P: {item.protein}g • C: {item.carbohydrates}g • F: {item.fats}g
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    <Pressable style={styles.actionBtn} onPress={() => openSearch(item.id)}>
                      <Ionicons name="swap-horizontal" size={18} color={colors.brand} />
                      <Text style={styles.actionBtnText}>Change</Text>
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={() => handleRemoveItem(item.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.warning} />
                      <Text style={[styles.actionBtnText, { color: colors.warning }]}>Remove</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Quantity Editor */}
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.qtyContainer}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item.id, Math.max(10, item.quantity - 10))}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={String(Math.round(item.quantity))}
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed)) handleUpdateQuantity(item.id, parsed);
                      }}
                    />
                    <Text style={styles.unitText}>{item.unit}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 10)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            ))}

            {/* Total Macros Dynamic Summary */}
            <Card variant="glass" style={styles.macroCard}>
              <Text style={styles.sectionHeader}>Macros Total Summary</Text>
              <View style={styles.macroGrid}>
                <View style={styles.macroCol}>
                  <Text style={styles.macroVal}>{totalMacros.calories}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={styles.macroVal}>{totalMacros.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={styles.macroVal}>{totalMacros.carbohydrates}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={styles.macroVal}>{totalMacros.fats}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </Card>

            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryButton} onPress={handleRetake}>
                <Ionicons name="close" size={20} color={colors.onSurface} />
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.primaryButton} onPress={saveMeal}>
                <Ionicons name="checkmark" size={20} color={colors.surface} />
                <Text style={styles.primaryButtonText}>Save Meal</Text>
              </Pressable>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Meal Scanner</Text>
      </View>
      
      {renderContent()}

      {/* Food Search Replacement Modal */}
      <Modal visible={searchModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Food Catalog</Text>
              <Pressable onPress={() => setSearchModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </Pressable>
            </View>

            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color={colors.onSurfaceSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Type food name..."
                placeholderTextColor={colors.onSurfaceSecondary}
                value={searchQuery}
                onChangeText={triggerSearch}
              />
            </View>

            {searching ? (
              <ActivityIndicator size="large" color={colors.brand} style={styles.modalSpinner} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.resultsList}
                renderItem={({ item }) => (
                  <Pressable style={styles.resultItem} onPress={() => selectFood(item)}>
                    <View>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultMacros}>
                        {item.calories} kcal/100g • P: {item.protein}g • C: {item.carbohydrates}g
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.brand} />
                  </Pressable>
                )}
                ListEmptyComponent={() => (
                  <Text style={styles.noResultsText}>
                    {searchQuery ? 'No foods matched.' : 'Type to search the verified food database.'}
                  </Text>
                )}
              />
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
  header: {
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  viewfinderContainer: {
    width: 260,
    height: 260,
    borderWidth: 1,
    borderColor: `${colors.brand}20`,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
    backgroundColor: `${colors.surfaceSecondary}50`,
  },
  viewfinderText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  viewfinderCornerTL: { position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.brand, borderTopLeftRadius: 8 },
  viewfinderCornerTR: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.brand, borderTopRightRadius: 8 },
  viewfinderCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.brand, borderBottomLeftRadius: 8 },
  viewfinderCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.brand, borderBottomRightRadius: 8 },
  promptText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  mockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
  },
  mockButtonLabel: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
  orText: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    flex: 1,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  secondaryButtonText: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  thumbnailImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
  },
  detectionHeader: {
    marginBottom: spacing.md,
  },
  scannerAnimationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  radarSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${colors.brand}10`,
  },
  spinner: {
    marginVertical: spacing.md,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  loadingSub: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginVertical: spacing.md,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  selectorCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: colors.brand,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  typeLabelSelected: {
    color: colors.surface,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '700',
  },
  itemMacros: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  quantityLabel: {
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '500',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  qtyInput: {
    width: 60,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    textAlign: 'center',
    color: colors.onSurface,
    fontWeight: '600',
    padding: 0,
  },
  unitText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    marginRight: spacing.xs,
  },
  macroCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCol: {
    alignItems: 'center',
    flex: 1,
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  macroLabel: {
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '70%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 2,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
  },
  modalSpinner: {
    marginTop: spacing.xl,
  },
  resultsList: {
    paddingBottom: spacing.xl,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  resultMacros: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
});
export default ScanContainer;
