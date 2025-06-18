import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import Button from '../components/Button';

const primaryColor = '#007AFF';
const errorColor = '#FF3B30';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { forgotPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const success = await forgotPassword(data.email);
      if (success) {
        Alert.alert(
          "Password Reset",
          "If an account with that email exists, a password reset email has been sent.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        setErrorMessage('Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error("Forgot Password API call error:", error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const textColor = isDarkMode ? '#E0E0E0' : '#333333';
  const inputBgColor = isDarkMode ? '#444444' : '#F8F8F8';
  const borderColor = isDarkMode ? '#666666' : '#DDDDDD';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#222222' : '#F0F2F5' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#222222' : '#F0F2F5'} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: primaryColor }]}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: primaryColor }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Enter your email and we'll send you a link to reset your password.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: borderColor }]}>
            <Controller
              name="email"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkMode ? '#B0B0B0' : '#AAAAAA'}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>

        {errorMessage && <Text style={styles.serverErrorText}>{errorMessage}</Text>}

        <Button
          title="Send Reset Link"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          isLoading={isLoading}
          style={[styles.resetButton, { backgroundColor: primaryColor }]}
          textStyle={styles.resetButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 25,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  errorText: {
    color: errorColor,
    fontSize: 13,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  serverErrorText: {
    color: errorColor,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  resetButton: {
    marginTop: 20,
    width: '100%',
    height: 50,
    borderRadius: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
