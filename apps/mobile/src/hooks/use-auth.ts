import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../services/auth-service';
import Toast from 'react-native-toast-message';

export function useAuth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);

    if (isEmailValid && isPassValid) {
      setLoading(true);
      try {
        await authService.login(email, password);
        router.replace('/(tabs)/dashboard' as any);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Invalid email or password.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    let valid = true;

    if (!fullName) {
      setNameError('Full name is required');
      valid = false;
    } else {
      setNameError('');
    }

    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);

    if (!isEmailValid) valid = false;
    if (!isPassValid) valid = false;

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (valid) {
      setLoading(true);
      try {
        await authService.register(fullName, email, password);
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Please log in with your credentials.',
        });
        router.replace('/(auth)/login' as any);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Could not create account.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    const isEmailValid = validateEmail(email);
    
    if (isEmailValid) {
      setLoading(true);
      try {
        await authService.forgotPassword(email);
        Toast.show({
          type: 'success',
          text1: 'Reset Link Sent',
          text2: 'Please check your email to reset your password.',
        });
        router.replace('/(auth)/login' as any);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: 'Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuestMode = () => {
    router.replace('/(tabs)/dashboard' as any);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    confirmPassword,
    setConfirmPassword,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    nameError,
    setNameError,
    confirmPasswordError,
    setConfirmPasswordError,
    loading,
    handleLogin,
    handleRegister,
    handleResetPassword,
    handleGuestMode,
  };
}
