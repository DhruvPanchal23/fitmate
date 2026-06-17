import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing, radius } from '../../../theme/spacing';
import { Card } from '../../../components/Card';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface AIRecommendationsListProps {
  recommendations: RecommendationItem[];
}

export const AIRecommendationsList = React.memo(({ recommendations }: AIRecommendationsListProps) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>AI Recommendations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiRecommendationsScroll}>
        {recommendations.map((rec) => (
          <Card key={rec.id} variant="solid" style={styles.recDashboardCard}>
            <View style={styles.recIconCircle}>
              <Ionicons
                name={
                  rec.type === 'exercise'
                    ? 'walk'
                    : rec.type === 'nutrition'
                    ? 'fast-food'
                    : rec.type === 'hydration'
                    ? 'water'
                    : 'bed'
                }
                size={16}
                color={colors.brand}
              />
            </View>
            <Text style={styles.recDashboardTitle}>{rec.title}</Text>
            <Text style={styles.recDashboardDesc}>{rec.description}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  aiRecommendationsScroll: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  recDashboardCard: {
    width: 200,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: 0,
  },
  recIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.brand}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  recDashboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.xxs,
  },
  recDashboardDesc: {
    fontSize: 12,
    color: colors.onSurfaceSecondary,
    lineHeight: 16,
  },
});

export default AIRecommendationsList;
