import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/use-auth';

export function ForgotPasswordContainer() {
  const router = useRouter();
  const {
    email,
    setEmail,
    emailError,
    loading,
    handleResetPassword,
  } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={36} color={colors.brand} />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              leftIcon="mail-outline"
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleResetPassword}
              loading={loading}
              size="lg"
              style={styles.resetButton}
            />
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => router.replace('/(auth)/login' as any)}>
              <Text style={styles.loginLink}>Back to Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
});
export default ForgotPasswordContainer;
