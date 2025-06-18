import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://backend-practice.eurisko.me/api';

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('🔒 No refresh token found in storage');
      return null;
    }

    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken,
      token_expires_in: '1y', // optional, depends on backend support
    });

    const newAccessToken = response.data?.data?.accessToken;

    if (!newAccessToken) {
      console.warn('⚠️ No accessToken returned in refresh response');
      return null;
    }

    await AsyncStorage.setItem('accessToken', newAccessToken);
    console.log('🔄 Access token refreshed successfully');
    return newAccessToken;
  } catch (err) {
    console.error('❌ Token refresh failed', err);
    return null;
  }
};
