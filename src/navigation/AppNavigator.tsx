import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';  // Import useTheme hook
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LogInScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import { RootStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isDarkMode } = useTheme();  

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: isDarkMode ? 'black' : 'white' }, 
        headerTintColor: isDarkMode ? 'white' : 'black',  
        contentStyle: { backgroundColor: isDarkMode ? 'black' : 'white' }, 
      }}
    >
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
