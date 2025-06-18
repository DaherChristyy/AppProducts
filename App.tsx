import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import Toast from 'react-native-toast-message';
import GlobalFont from 'react-native-global-font';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';

export default function App() {
  useEffect(() => {
    const fontName = Platform.select({
      ios: 'Oswald-Regular',
      android: 'Oswald-Regular', 
    });
    if (fontName) {
      GlobalFont.applyGlobal(fontName);
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
