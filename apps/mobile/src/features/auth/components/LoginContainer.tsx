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

export function LoginContainer() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    loading,
    handleLogin,
    handleGuestMode,
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
              <Ionicons name="flame" size={40} color={colors.brand} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to track your fitness targets today.</Text>
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

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Pressable
              onPress={() => router.navigate('/(auth)/forgot-password' as any)}
              style={styles.forgotPasswordPress}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginButton}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue as Guest"
            onPress={handleGuestMode}
            variant="glass"
            size="lg"
            style={styles.guestButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.navigate('/(auth)/register' as any)}>
              <Text style={styles.registerLink}>Register</Text>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
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
  forgotPasswordPress: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    color: colors.onSurfaceTertiary,
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  guestButton: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
});
export default LoginContainer;
