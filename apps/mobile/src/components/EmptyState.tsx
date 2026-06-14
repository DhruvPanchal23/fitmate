import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  iconName = 'document-text-outline',
  actionTitle,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconBackground}>
        <Ionicons name={iconName} size={36} color={colors.brand} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          size="sm"
          fullWidth={false}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.xl,
  },
  iconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  button: {
    alignSelf: 'center',
  },
});
