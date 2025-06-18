import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, View, ActivityIndicator } from 'react-native';
import { User } from '../types/types';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImage?: { uri: string; name: string; type: string };
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  user: User | null;
  updateUser: (user: User) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);

        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          await fetchUserInfo(token);
        }

        if (userId) {
          console.log('🔁 Restored userId:', userId);
        }
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (token: string): Promise<User | null> => {
    try {
      const res = await API.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = res.data?.data?.user;
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('🙋‍♂️ User profile loaded from /user/profile:', userData);
        return userData;
      } else {
        console.warn('⚠️ No user object returned from /user/profile');
        return null;
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch user profile:', err);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Logging in with:', email);
      const res = await API.post('/auth/login', {
        email,
        password,
        token_expires_in: '1y',
      });

      const { accessToken, refreshToken } = res.data.data;

      const decoded: DecodedToken = jwtDecode(accessToken);
      const userId = decoded?.userId;

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setIsAuthenticated(true);

      await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      } else {
        await AsyncStorage.removeItem('refreshToken');
      }

      if (userId) {
        await AsyncStorage.setItem('userId', userId);
        console.log('✅ Stored userId:', userId);
      } else {
        await AsyncStorage.removeItem('userId');
        console.warn("⚠️ Decoded token but 'userId' is missing.");
      }

      await fetchUserInfo(accessToken);
      console.log('✅ Login successful');
      return true;
    } catch (error: any) {
      console.error('❌ Login failed:', JSON.stringify(error?.response?.data, null, 2), error.message);
      Alert.alert(
        'Login Failed',
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error.message ||
          'Something went wrong'
      );
      return false;
    }
  };

  const signup = async (user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImage?: { uri: string; name?: string; type?: string };
  }): Promise<void> => {
    try {
      console.log('📤 Sending signup data:', user);

      const formData = new FormData();
      formData.append('firstName', user.firstName);
      formData.append('lastName', user.lastName);
      formData.append('email', user.email);
      formData.append('password', user.password);

      if (user.profileImage) {
        formData.append('profileImage', {
          uri: user.profileImage.uri,
          name: user.profileImage.name ?? 'photo.jpg',
          type: user.profileImage.type ?? 'image/jpeg',
        } as any);
      }

      await API.post('/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Signup Success', 'Check your email for the OTP');
    } catch (error: any) {
      const message =
        error.message === 'Network Error'
          ? 'Network error: unable to reach the server. Please check your connection.'
          : error?.response?.data?.error?.message ?? error?.response?.data?.message ?? error.message;

      console.error('❌ Signup failed:', message);
      Alert.alert('Signup Failed', message);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('📧 Sending password reset to:', email);
      const response = await API.post('/auth/forgot-password', { email });

      if (response.data.success) {
        console.log('✅ Password reset email sent:', response.data.data.message);
        return true;
      }

      console.warn('⚠️ Forgot password failed:', response.data);
      return false;
    } catch (error: any) {
      console.error('❌ Forgot password API error:', JSON.stringify(error?.response?.data, null, 2), error.message);
      Alert.alert(
        'Password Reset',
        'If an account with that email exists, a password reset email has been sent. Please check your inbox.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'userId']);
    console.log('🟢 User logged out');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('🔄 User updated in context and storage:', updatedUser);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        signup,
        forgotPassword,
        user,
        updateUser,
        token: accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
