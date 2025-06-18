import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import Button from '../components/Button';

const primaryColor = '#007AFF';
const errorColor = '#FF3B30';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type FormData = z.infer<typeof schema>;
type LogInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LogInScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toggleDarkMode, isDarkMode } = useTheme();
  const navigation = useNavigation<LogInScreenNavigationProp>();

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    setIsLoggingIn(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          })
        );
      } else {
        setErrorMessage('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error("Login API call error:", error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const textColor = isDarkMode ? '#E0E0E0' : '#333333';
  const inputBgColor = isDarkMode ? '#444444' : '#F8F8F8';
  const borderColor = isDarkMode ? '#666666' : '#DDDDDD';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#222222' : '#F0F2F5' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#222222' : '#F0F2F5'} />

      <TouchableOpacity style={styles.darkModeToggle} onPress={toggleDarkMode}>
        <Text style={[styles.darkModeText, { color: isDarkMode ? 'white' : primaryColor }]}>
          {isDarkMode ? '🌙 Mode' : '☀️ Mode'}
        </Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={[styles.appName, { color: primaryColor }]}>EuriskoAcademy</Text>
        <Text style={[styles.welcomeText, { color: textColor }]}>👋 Hello There!</Text>
        <Text style={[styles.tagline, { color: textColor }]}>Welcome back, please login to your account.</Text>
      </View>

      <View style={styles.formContainer}>
        {[
          { label: 'Email', name: 'email', keyboardType: 'email-address', secureTextEntry: false },
          { label: 'Password', name: 'password', keyboardType: 'default', secureTextEntry: true },
        ].map(({ label, name, keyboardType, secureTextEntry }) => (
          <View key={name} style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              {label === 'Email' ? ' ' : ' '}
              {label}
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor }]}>
              <Controller
                name={name as keyof FormData}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    placeholderTextColor={isDarkMode ? '#B0B0B0' : '#AAAAAA'}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboardType as KeyboardTypeOptions}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
            </View>
            {errors[name as keyof FormData] && (
              <Text style={styles.errorText}>
                {errors[name as keyof FormData]?.message}
              </Text>
            )}
          </View>
        ))}

        {errorMessage && <Text style={styles.serverErrorText}>{errorMessage}</Text>}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordButton}>
          <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          title=" Log In"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoggingIn}
          isLoading={isLoggingIn}
          style={[styles.loginButton, { backgroundColor: primaryColor }]}
          textStyle={styles.loginButtonText}
        />

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpButton}>
          <Text style={[styles.signUpText, { color: primaryColor }]}>
            Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
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
  darkModeToggle: {
    position: 'absolute',
    top: 50,
    right: 25,
    padding: 10,
  },
  darkModeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 0,
    width: '100%',
    height: 50,
    borderRadius: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    marginTop: 25,
    padding: 10,
  },
  signUpText: {
    fontSize: 15,
  },
  signUpLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LogInScreen;
