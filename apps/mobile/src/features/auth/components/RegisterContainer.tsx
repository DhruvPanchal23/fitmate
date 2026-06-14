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

export function RegisterContainer() {
  const router = useRouter();
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    nameError,
    emailError,
    passwordError,
    confirmPasswordError,
    loading,
    handleRegister,
  } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="flame" size={36} color={colors.brand} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start tracking your meals and fitness goals.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              error={nameError}
              autoCapitalize="words"
              leftIcon="person-outline"
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmPasswordError}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.navigate('/(auth)/login' as any)}>
              <Text style={styles.loginLink}>Log In</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
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
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
});
export default RegisterContainer;
