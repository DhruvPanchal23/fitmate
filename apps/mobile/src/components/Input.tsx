import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, ViewStyle, TextStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? colors.error : focused ? colors.brand : colors.onSurfaceTertiary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.textInput, inputStyle]}
          selectionColor={colors.brand}
        />
        
        {secureTextEntry ? (
          <Pressable onPress={() => setHidePassword(!hidePassword)} style={styles.rightIcon}>
            <Ionicons
              name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.onSurfaceTertiary}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable onPress={onRightIconPress} disabled={!onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.onSurfaceTertiary} />
          </Pressable>
        ) : null}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.brand,
    backgroundColor: colors.surfaceSecondary,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
    height: '100%',
  },
  rightIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
