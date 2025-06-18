import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types/types';
import API from '../api/axiosInstance';

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type FormData = z.infer<typeof schema>;
type VerificationRouteProp = RouteProp<RootStackParamList, 'VerificationScreen'>;
type VerificationNavProp = StackNavigationProp<RootStackParamList>;

const VerificationScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [verified, setVerified] = useState(false);

  const route = useRoute<VerificationRouteProp>();
  const navigation = useNavigation<VerificationNavProp>();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const email = route.params.email;
  const password = route.params.password;

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const verifyRes = await API.post('/auth/verify-otp', {
        email,
        otp: data.otp,
      });

      if (verifyRes.data.success) {
        const loginRes = await API.post('/auth/login', {
          email,
          password,
          token_expires_in: '1y',
        });

        const { accessToken, refreshToken } = loginRes.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        setVerified(true);
        Alert.alert('✅ Success', 'Account verified. Please wait...');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }, 2000);
      } else {
        Alert.alert('❌ Verification Failed', 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) {
      return Alert.alert('Missing Email', 'Email is required to resend OTP.');
    }

    setResending(true);
    try {
      await API.post('/auth/resend-verification-otp', { email });
      Alert.alert('📩 OTP Sent', 'A new OTP has been sent to your email.');
      setCountdown(60);
    } catch (error: any) {
      Alert.alert('Resend Failed', error?.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFF' }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
        <Text style={{ fontSize: 22, color: isDarkMode ? '#FFF' : '#000' }}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.darkModeToggle} onPress={toggleDarkMode}>
        <Text style={{ fontSize: 13, color: isDarkMode ? '#CCC' : '#333' }}>
          {isDarkMode ? '☀️ Mode' : '🌙 Mode'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
        Enter Your OTP Code
      </Text>

      {verified ? (
        <Text style={styles.verifiedText}>✅ Verification successful. Please wait...</Text>
      ) : (
        <>
          <Controller
            control={control}
            name="otp"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F2',
                    color: isDarkMode ? '#FFF' : '#000',
                    borderColor: errors.otp ? 'red' : isDarkMode ? '#333' : '#CCC',
                  },
                ]}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                keyboardType={'number-pad' as KeyboardTypeOptions}
                autoFocus
                maxLength={6}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.otp && <Text style={styles.error}>{errors.otp.message}</Text>}

          <Button
            title={isLoading ? 'Verifying...' : 'Verify'}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          />

          <TouchableOpacity onPress={resendOtp} disabled={resending || countdown > 0}>
            <Text style={[styles.resend, { color: isDarkMode ? '#AAA' : '#007AFF' }]}>
              {countdown > 0
                ? `Resend OTP in ${countdown}s`
                : resending
                ? 'Resending...'
                : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center',
  },
  backArrow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    left: 20,
    zIndex: 5,
  },
  darkModeToggle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    right: 20,
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
  },
  resend: {
    marginTop: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  verifiedText: {
    fontSize: 16,
    color: 'green',
    marginTop: 20,
  },
});

export default VerificationScreen;
