import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext'; 
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import Button from '../components/Button';

type FormData = {
  email: string;
  password: string;
};

type LogInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LogInScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login, user } = useAuth();  
  const [errorMessage, setErrorMessage] = useState('');
  const { toggleDarkMode, isDarkMode } = useTheme();  
  const navigation = useNavigation<LogInScreenNavigationProp>();

  const onSubmit = (data: FormData) => {
    console.log("Trying to log in with:", data);
    if ((data.email === user.email && data.password === user.password) || (data.email === 'eurisko' && data.password === 'academy2025')) {
      console.log("Credentials verified! Redirecting to OTP Verification...");
      navigation.navigate("VerificationScreen");
    } else {
      setErrorMessage("Invalid credentials");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      {/* Dark Mode Menu Option */}
      <TouchableOpacity 
        style={styles.darkModeMenuOption} 
        onPress={toggleDarkMode}>
        <Text style={[styles.darkModeText, { color: isDarkMode ? 'white' : 'black' }]}>Dark Mode</Text>
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>Email</Text>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              style={[styles.input, { backgroundColor: isDarkMode ? '#555' : '#fff', color: isDarkMode ? 'white' : 'black' }]}
              placeholder="Enter your email"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={[styles.label, { color: isDarkMode ? 'white' : 'black' }]}>Password</Text>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextInput
              style={[styles.input, { backgroundColor: isDarkMode ? '#555' : '#fff', color: isDarkMode ? 'white' : 'black' }]}
              placeholder="Enter your password"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <Button title="Log In" onPress={handleSubmit(onSubmit)} />

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.signUpText, { color: isDarkMode ? 'white' : 'blue' }]}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Optional Logo */}
      <Image
        source={{ uri: 'https://your-image-url.com' }} // If needed, use a remote logo
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkModeMenuOption: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  darkModeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  error: { color: 'red', marginBottom: 10 },
  signUpText: {
    marginTop: 10,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  logo: {
    marginTop: 40,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default LogInScreen;
