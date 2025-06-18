import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProductListScreen from '../screens/ProductListScreen';
import NewPostsScreen from '../screens/NewPostsScreen';
import { useTheme } from '../context/ThemeContext';
import { AppTabParamList } from '../types/types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabNavigator: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#666',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#333333' : '#E0E0E0',
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ tabBarLabel: 'Products' }}
      />
      <Tab.Screen
        name="NewPosts"
        component={NewPostsScreen}
        options={{ tabBarLabel: 'Posts' }}
      />
    </Tab.Navigator>
  );
};

export default AppTabNavigator;
