import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../api/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'https://backend-practice.eurisko.me';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/profile');
      const fetched = res.data.data.user;
      setFirstName(fetched.firstName || '');
      setLastName(fetched.lastName || '');
      setEmail(fetched.email || '');
      setProfileImage(fetched.profileImage);
      setLoading(false);
    } catch (err) {
      console.error(`Fetch attempt ${retryCount + 1} failed`, err);
      if (retryCount < MAX_RETRIES - 1) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchProfile, 1000);
      } else {
        Alert.alert('Error', 'Failed to load profile after multiple attempts.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (profileImage?.uri) {
        formData.append('profileImage', {
          uri: profileImage.uri,
          name: profileImage.fileName || 'profile.jpg',
          type: profileImage.type || 'image/jpeg',
        } as any);
      }
      const res = await API.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.data.user);
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update profile', err);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  const textColor = isDarkMode ? '#fff' : '#000';
  const bgColor = isDarkMode ? '#111' : '#fff';
  const inputBg = isDarkMode ? '#222' : '#f9f9f9';
  const labelColor = isDarkMode ? '#ccc' : '#333';

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrowBox}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bgColor }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrowBox}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profileImage?.uri || profileImage?.url ? (
          <Image
            source={{ uri: profileImage.uri || `${BASE_URL}${profileImage.url}` }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.label, { color: labelColor }]}>First Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
      />

      <Text style={[styles.label, { color: labelColor }]}>Last Name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
      />

      <Text style={[styles.label, { color: labelColor }]}>Email</Text>
      <TextInput
        value={email}
        editable={false}
        style={[styles.input, { backgroundColor: '#EEE', color: '#999' }]}
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={updating}>
        <Text style={styles.saveButtonText}>{updating ? 'Saving...' : '💾 Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    minHeight: '100%',
  },
  backArrowBox: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileScreen;
