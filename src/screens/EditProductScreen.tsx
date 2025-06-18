import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView,
  Platform, Modal, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset, ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { RootStackParamList } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axiosInstance';

const BASE_URL = 'https://backend-practice.eurisko.me';
const API_URL = `${BASE_URL}/api`;

interface AppImage {
  uri: string;
  fileName?: string | null;
  type?: string | null;
  isStored?: boolean;
}

type EditProductNavProps = NativeStackNavigationProp<RootStackParamList>;

const EditProductScreen = () => {
  const navigation = useNavigation<EditProductNavProps>();
  const route = useRoute<any>();
  const { isDarkMode } = useTheme();
  const initial = route.params.product;

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(String(initial.price));
  const [location, setLocation] = useState(
    initial.location ? {
      lat: initial.location.latitude,
      lng: initial.location.longitude,
    } : { lat: 0, lng: 0 }
  );
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<AppImage[]>(initial.images.map((img: { url: string }) => ({
    uri: `${BASE_URL}${img.url}`,
    fileName: img.url.split('/').pop() || undefined,
    type: 'image/jpeg',
    isStored: true,
  })));
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.lat !== 0 && location.lng !== 0) {
      reverseGeocode(location.lat, location.lng);
    }
  }, [location]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`, {
        headers: {
          'User-Agent': 'CheghelAhleApp/1.0 (daherchristy1@gmail.com)'
        }
      });
      const data = await res.json();
      setAddress(data.display_name || 'Unknown location');
    } catch (err) {
      setAddress('Could not fetch address');
    }
  };

  const handlePermission = async (type: 'camera' | 'gallery') => {
    const permission = Platform.OS === 'android'
      ? type === 'camera' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : type === 'camera' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.IOS.PHOTO_LIBRARY;

    const status = await check(permission);
    if (status === RESULTS.GRANTED) return true;
    if (status === RESULTS.DENIED) {
      const req = await request(permission);
      return req === RESULTS.GRANTED;
    }
    Alert.alert('Permission Needed', 'Please enable permission in settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => openSettings().catch(() => {
          Toast.show({ type: 'error', text1: 'Failed to open settings', text2: 'Please open manually' });
        })
      }
    ]);
    return false;
  };

  const pickImage = async () => {
    if (!(await handlePermission('gallery'))) return;
    launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 5 }, handleImageResponse);
  };

  const openCamera = async () => {
    if (!(await handlePermission('camera'))) return;
    launchCamera({ mediaType: 'photo', quality: 1 }, handleImageResponse);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.assets?.length) {
      const newImages = response.assets.map(asset => ({
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        isStored: false,
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('Remove Image?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setImages(prev => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const openMapPicker = () => {
    navigation.navigate('MapPicker', {
      initialLocation: { latitude: location.lat, longitude: location.lng },
      onSelect: coords => setLocation({ lat: coords.latitude, lng: coords.longitude }),
    });
  };

  const validate = () => {
    if (name.length < 3) return 'Name too short';
    if (description.length < 3) return 'Description too short';
    if (!price || isNaN(+price) || +price <= 0) return 'Invalid price';
    if (!images.length) return 'Add at least one image';
    if (!location.lat || !location.lng) return 'Select a location';
    return null;
  };

  const submitUpdate = async () => {
    const error = validate();
    if (error) return Alert.alert('Error', error);

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('location[latitude]', location.lat.toString());
    formData.append('location[longitude]', location.lng.toString());
    formData.append('location[name]', address);

    images.filter(i => !i.isStored).forEach((img, idx) => {
      formData.append('images', {
        uri: img.uri,
        name: img.fileName || `image_${idx}.jpg`,
        type: img.type || 'image/jpeg',
      } as any);
    });

    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.put(`${API_URL}/products/${initial._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Toast.show({ type: 'success', text1: 'Product updated successfully!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#111' : '#fff' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>🛍️ Name</Text>
        <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>📝 Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput, isDarkMode && styles.inputDark]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>💰 Price</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>📍 Location</Text>
        <TouchableOpacity onPress={openMapPicker} style={styles.input}>
          <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{address || 'Tap to select location'}</Text>
        </TouchableOpacity>

        <View style={styles.imageActions}>
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}><Text>🖼️ Gallery</Text></TouchableOpacity>
          <TouchableOpacity onPress={openCamera} style={styles.imageButton}><Text>📷 Camera</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal>
          {images.map((img, i) => (
            <TouchableOpacity key={img.uri} onLongPress={() => removeImage(i)}>
              <Image source={{ uri: img.uri }} style={styles.image} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={submitUpdate} style={styles.button}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>✅ Save Changes</Text>}
          </TouchableOpacity>
        </View>

        <Modal visible={!!previewImg} transparent>
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => setPreviewImg(null)} style={styles.modalClose}><Text>✖️</Text></TouchableOpacity>
            {previewImg && <Image source={{ uri: previewImg }} style={styles.modalImage} />}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingTop: 60 },
  backArrow: {
    position: 'absolute', top: 20, left: 20, zIndex: 10,
    backgroundColor: '#ccc', padding: 8, borderRadius: 20,
  },
  backArrowText: {
    color: '#000', fontSize: 20, fontWeight: 'bold',
  },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 15, backgroundColor: '#f2f2f2',
  },
  inputDark: { backgroundColor: '#333', color: '#fff' },
  descriptionInput: { minHeight: 80, textAlignVertical: 'top' },
  imageActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  imageButton: {
    flex: 1, borderWidth: 1, borderColor: '#aaa', padding: 12, borderRadius: 8,
    alignItems: 'center', marginHorizontal: 5,
  },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  button: {
    backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modal: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center',
  },
  modalImage: { width: '90%', height: '80%', resizeMode: 'contain' },
  modalClose: { position: 'absolute', top: 40, right: 20 },
});

export default EditProductScreen;
