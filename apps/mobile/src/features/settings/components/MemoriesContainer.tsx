import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Card } from '../../../components/Card';
import useAISettings from '../../../hooks/use-ai-settings';

export function MemoriesContainer() {
  const router = useRouter();
  const {
    memories,
    isLoading,
    refetchAll,
    updateMemoryStatus,
    deleteMemory,
  } = useAISettings();

  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'ignored'>('all');

  useEffect(() => {
    refetchAll();
  }, []);

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'allergies':
        return '#FF453A'; // red
      case 'dislikes':
        return '#FF9F0A'; // orange
      case 'favorite_foods':
        return '#30D158'; // green
      case 'workout_habits':
        return '#BF5AF2'; // purple
      default:
        return colors.brand;
    }
  };

  const filteredMemories = memories.filter((item) => {
    if (activeTab === 'pinned') return item.isPinned;
    if (activeTab === 'ignored') return item.isIgnored;
    return !item.isIgnored; // default tab doesn't show ignored ones
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScreenHeader
        title="AI Memory Vault"
        subtitle="Evolving facts from your coach conversations"
        showBackButton={true}
        onBackButtonPress={() => router.back()}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('all')}
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Active</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('pinned')}
          style={[styles.tab, activeTab === 'pinned' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'pinned' && styles.tabTextActive]}>Pinned</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('ignored')}
          style={[styles.tab, activeTab === 'ignored' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'ignored' && styles.tabTextActive]}>Ignored</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Retrieving memories...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="bulb-outline" size={48} color={colors.onSurfaceTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Memories Found</Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'all'
                  ? 'Your AI Coach automatically learns your dietary preferences, allergies, dislikes, and schedules as you chat!'
                  : activeTab === 'pinned'
                  ? 'Pin important facts to keep them permanently in the AI context.'
                  : 'No ignored memories in vault.'}
              </Text>
            </View>
          ) : (
            filteredMemories.map((item) => {
              const catColor = getCategoryColor(item.category);
              return (
                <Card key={item.id} variant="solid" style={styles.memoryCard}>
                  <View style={styles.memoryHeader}>
                    <View style={[styles.categoryTag, { backgroundColor: catColor + '20' }]}>
                      <Text style={[styles.categoryText, { color: catColor }]}>
                        {getCategoryLabel(item.category)}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      {/* Pin Button */}
                      <Pressable
                        onPress={() =>
                          updateMemoryStatus({ id: item.id, isPinned: !item.isPinned })
                        }
                        style={styles.actionIcon}
                      >
                        <Ionicons
                          name={item.isPinned ? 'pin' : 'pin-outline'}
                          size={18}
                          color={item.isPinned ? '#FFD60A' : colors.onSurfaceSecondary}
                        />
                      </Pressable>

                      {/* Ignore/Eye Button */}
                      <Pressable
                        onPress={() =>
                          updateMemoryStatus({ id: item.id, isIgnored: !item.isIgnored })
                        }
                        style={styles.actionIcon}
                      >
                        <Ionicons
                          name={item.isIgnored ? 'eye' : 'eye-off-outline'}
                          size={18}
                          color={colors.onSurfaceSecondary}
                        />
                      </Pressable>

                      {/* Delete Button */}
                      <Pressable
                        onPress={() => deleteMemory(item.id)}
                        style={styles.actionIcon}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF453A" />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.memoryContent}>{item.content}</Text>
                  <Text style={styles.memoryDate}>
                    Learned on: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </Card>
              );
            })
          )}

          {memories.length > 0 && activeTab === 'all' && (
            <Pressable
              onPress={() => deleteMemory(undefined)} // deletes all when id is omitted
              style={styles.clearAllBtn}
            >
              <Text style={styles.clearAllText}>Wipe Memory Vault</Text>
            </Pressable>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Custom wrapper to ensure SafeAreaView uses React Native Elements correctly
function SafeAreaView({ children, style, edges }: any) {
  const insets = require('react-native-safe-area-context').useSafeAreaInsets();
  const styleCombined = [
    {
      flex: 1,
      backgroundColor: colors.surface,
      paddingBottom: edges?.includes('bottom') ? insets.bottom : 0,
    },
    style,
  ];
  return <View style={styleCombined}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurfaceSecondary,
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.brand,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  memoryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 14,
    padding: 2,
  },
  memoryContent: {
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '500',
    lineHeight: 20,
  },
  memoryDate: {
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.sm,
  },
  clearAllBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF453A',
  },
  bottomSpacer: {
    height: 40,
  },
});
export default MemoriesContainer;
