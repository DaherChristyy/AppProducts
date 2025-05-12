import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../context/ThemeContext';  

const VerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { isDarkMode } = useTheme();  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'VerificationScreen'>>();

  const onSubmit = () => {
    if (otp === '1234') {
      console.log('OTP Verified:', otp);
      navigation.navigate("ProductList");  
    } else {
      setErrorMessage('Invalid OTP');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Enter OTP</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#555' : '#fff', color: isDarkMode ? 'white' : 'black' }]}
        placeholder="0000"
        keyboardType="numeric"
        maxLength={4}
        value={otp}
        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}  
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button title="Verify" onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    width: '50%',
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 5,
  },
  error: { color: 'red', marginBottom: 10 },
});

export default VerificationScreen;
