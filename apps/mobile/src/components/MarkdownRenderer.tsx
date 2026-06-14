import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface MarkdownRendererProps {
  text: string;
  style?: any;
}

export function MarkdownRenderer({ text, style }: MarkdownRendererProps) {
  if (!text) return null;

  const lines = text.split('\n');

  const parseBoldText = (txt: string) => {
    const parts = txt.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text key={index} style={styles.boldText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const rendered = lines.map((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <Text key={index} style={[styles.h3, style]}>
          {parseBoldText(trimmed.substring(4))}
        </Text>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <Text key={index} style={[styles.h2, style]}>
          {parseBoldText(trimmed.substring(3))}
        </Text>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <Text key={index} style={[styles.h1, style]}>
          {parseBoldText(trimmed.substring(2))}
        </Text>
      );
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <View key={index} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, style]}>•</Text>
          <Text style={[styles.bulletText, style]}>
            {parseBoldText(trimmed.substring(2))}
          </Text>
        </View>
      );
    }

    // Plain text
    return (
      <Text key={index} style={[styles.paragraph, style]}>
        {parseBoldText(line)}
      </Text>
    );
  });

  return <View style={styles.container}>{rendered}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurface,
    marginBottom: 4,
  },
  h1: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  h2: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.brand,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurface,
  },
});

export default MarkdownRenderer;
