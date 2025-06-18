import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet, TextStyle, Text } from 'react-native';

import AppTabNavigator from './AppTabNavigator';
import LoginScreen from '../screens/LogInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UploadedProductsScreen from '../screens/UploadedProductsScreen';

import { RootStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  const defaultScreenOptions = {
    headerStyle: {
      backgroundColor: isDarkMode ? '#222222' : '#F0F2F5',
    },
    headerTintColor: isDarkMode ? 'white' : '#333333',
    headerTitleStyle: {
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },
    headerBackTitleVisible: false,
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={AppTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{
              headerShown: true,
              headerTitle: () => (
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 15 }}>
                  Add New Product
                </Text>
              ),
            }}
          />
          <Stack.Screen
            name="EditProduct"
            component={EditProductScreen}
            options={{ title: 'Edit Product', headerShown: false }}
          />
          <Stack.Screen
            name="MapPicker"
            component={MapPickerScreen}
            options={{ title: 'Select Location' }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UploadedProducts"
            component={UploadedProductsScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VerificationScreen"
            component={VerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
