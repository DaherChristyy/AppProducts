import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ToastAndroid,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axiosInstance';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://backend-practice.eurisko.me';

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  profileImage?: { url: string };
  isEmailVerified: boolean;
  createdAt?: string;
};

const ProfileScreen: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const showAppToast = (msg: string) => {
    Platform.OS === 'android'
      ? ToastAndroid.show(msg, ToastAndroid.SHORT)
      : Alert.alert('Info', msg);
  };

  const fetchProfile = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        showAppToast('Token not found. Please log in again.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const res = await API.get(`/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data?.data?.user ?? res.data?.user ?? res.data;
      setProfileData(user);
    } catch (error: any) {
      console.error('Profile fetch failed:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not load profile. Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const profileImageUrl = profileData?.profileImage?.url?.startsWith('http')
    ? profileData.profileImage.url
    : `${BASE_URL}${profileData?.profileImage?.url ?? ''}`;

  if (loading && !profileData) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#121212' : '#FFF' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: isDarkMode ? '#FFF' : '#000', marginTop: 10 }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#121212' : '#FFF' }]}>
        <Text style={{ color: isDarkMode ? '#FFF' : '#000' }}>
          No profile data available.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#FFF' }}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProfile();
          }}
          tintColor="#007AFF"
        />
      }
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
          Your Profile
        </Text>

        <TouchableOpacity onPress={toggleDarkMode}>
          <Text style={styles.modeToggle}>
            {isDarkMode ? '🌙' : '☀️'} Mode
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F2' }]}>
        {profileData.profileImage?.url ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {profileData.firstName?.[0]?.toUpperCase()}{profileData.lastName?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.name, { color: isDarkMode ? '#FFF' : '#000' }]}>
          {profileData.firstName} {profileData.lastName || ''}
        </Text>
        <Text style={[styles.email, { color: isDarkMode ? '#AAA' : '#555' }]}>
          {profileData.email}
        </Text>
        <Text style={{ marginTop: 6, color: isDarkMode ? '#888' : '#777', fontSize: 13 }}>
          Member since: {profileData.createdAt?.split('T')[0] || 'N/A'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFF' }]}>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfileScreen')}>
          <Text style={[styles.optionText, { color: isDarkMode ? '#E0E0E0' : '#333' }]}>✏️ Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('UploadedProducts')}>
          <Text style={[styles.optionText, { color: isDarkMode ? '#E0E0E0' : '#333' }]}>📦 View Uploaded Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: 'red' }]}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerComment}>
        <Text style={{ color: isDarkMode ? '#777' : '#666', fontSize: 13, fontStyle: 'italic' }}>
          “Everything is simple and works great – I really like this app so far.”
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollViewContent: { alignItems: 'center', paddingBottom: 40 },
  header: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modeToggle: {
    fontSize: 14,
    color: '#007AFF',
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 1,
  },
  avatar: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  avatarFallback: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: { fontSize: 20, fontWeight: '600' },
  email: { fontSize: 15 },
  section: {
    width: '90%',
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    elevation: 1,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
  footerComment: {
    marginTop: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
});

export default ProfileScreen;
