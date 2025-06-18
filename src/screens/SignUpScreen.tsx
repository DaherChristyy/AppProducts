import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters'),
  phone: z.string().min(10, 'Phone number should be at least 10 characters'),
});

type FormData = z.infer<typeof signUpSchema>;
type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signup } = useAuth();
  const { toggleDarkMode, isDarkMode } = useTheme();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await signup({
        email: data.email,
        password: data.password,
        firstName: data.name,
        lastName: data.name,
      });

      Alert.alert('✅ Success', 'An OTP has been sent to your email.');
      navigation.navigate('VerificationScreen', {
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert('❌ Signup Failed', 'Unable to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { label: 'Name', name: 'name', keyboardType: 'default', secureTextEntry: false },
    { label: 'Email', name: 'email', keyboardType: 'email-address', secureTextEntry: false },
    { label: 'Password', name: 'password', keyboardType: 'default', secureTextEntry: true },
    { label: 'Phone Number', name: 'phone', keyboardType: 'phone-pad', secureTextEntry: false },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
        <Text style={{ fontSize: 30, color: isDarkMode ? '#fff' : '#000' }}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggle} onPress={toggleDarkMode}>
        <Text style={{ fontSize: 15, color: isDarkMode ? '#CCC' : '#333' }}>
          {isDarkMode ? '☀️ Mode' : '🌙 Mode'}
        </Text>
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>
          Create your account
        </Text>

        {inputFields.map(({ label, name, keyboardType, secureTextEntry }) => (
          <View key={name} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDarkMode ? '#EEE' : '#333' }]}>{label}</Text>
            <Controller
              name={name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? '#1E1E1E' : '#F0F0F0',
                      color: isDarkMode ? '#FFF' : '#000',
                      borderColor: errors[name] ? 'red' : isDarkMode ? '#333' : '#CCC',
                    },
                  ]}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  placeholderTextColor={isDarkMode ? '#777' : '#999'}
                  value={value}
                  onChangeText={onChange}
                  keyboardType={keyboardType}
                  secureTextEntry={secureTextEntry}
                />
              )}
            />
            {errors[name] && (
              <Text style={styles.errorText}>{errors[name]?.message}</Text>
            )}
          </View>
        ))}

        <Button
          title={isLoading ? 'Signing Up...' : 'Sign Up'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </View>

      {/* <Image
        source={{ uri: 'https://your-image-url.com/logo.png' }}
        style={styles.logo}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backArrow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    left: 20,
    zIndex: 5,
  },
  toggle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    alignSelf: 'center',
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 30,
  },
});

export default SignUpScreen;
