import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken } from '../utils/auth';

interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const API = axios.create({
  baseURL: 'https://backend-practice.eurisko.me/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/signup')) {
    return config; 
  }

  const token = await AsyncStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest); 
        }
      } catch (refreshError) {
        console.warn('🔁 Token refresh failed. Clearing session...');
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'userId']);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
