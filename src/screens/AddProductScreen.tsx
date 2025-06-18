// AddProductScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  ImagePickerResponse,
} from 'react-native-image-picker';
import MapView, { Marker } from 'react-native-maps';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import API from '../api/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddProduct'>;

const AddProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { isDarkMode } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<Asset[]>([]);
  const [latitude, setLatitude] = useState(33.8938); // Beirut
  const [longitude, setLongitude] = useState(35.5018);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!resolvedAddress && latitude && longitude) reverseGeocode(latitude, longitude);
  }, []);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { latitude, longitude, address } = route.params.selectedLocation;
      setLatitude(latitude);
      setLongitude(longitude);
      setResolvedAddress(address || '');
      setSearchQuery(address || '');
      navigation.setParams({ selectedLocation: undefined });
    }
  }, [route.params?.selectedLocation]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
        { headers: { 'User-Agent': 'YourAppName/1.0 (daherchristy1@gmail.com)'} }
      );
      const data = await res.json();
      const { road, suburb, city, town, village, state, country } = data.address || {};
      const location = [road, suburb, city || town || village, state, country].filter(Boolean).join(', ');
      setResolvedAddress(location || data.display_name || 'Unknown location');
    } catch (e) {
      console.error(e);
      setResolvedAddress('Unable to retrieve address');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return Alert.alert('Enter a location to search.');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'YourApp/1.0 (daherchristy1@gmail.com)' } }
      );
      const results = await res.json();
      if (results.length) {
        const { lat, lon } = results[0];
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
        reverseGeocode(parseFloat(lat), parseFloat(lon));
      } else {
        Alert.alert('Location not found.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Failed to search location.');
    }
  };

  const navigateToMapPicker = () => {
    navigation.navigate('MapPicker', {
      initialLocation: { latitude, longitude },
      onSelect: ({ latitude, longitude, address }) => {
        setLatitude(latitude);
        setLongitude(longitude);
        setResolvedAddress(address || '');
        setSearchQuery(address || '');
      },
    });
  };

  const handlePermission = async (type: 'camera' | 'gallery') => {
    const version = Number(Platform.Version);
    let permission;

    if (type === 'camera') {
      permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    } else {
      permission = Platform.OS === 'android'
        ? version >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY;
    }

    const result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.BLOCKED) {
      Alert.alert('Permission Blocked', 'Please enable in settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings().catch(() => {}) },
      ]);
      return false;
    }

    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  };

  const handleChooseImage = () => {
    Alert.alert('📷 Choose Image', 'Select image source', [
      {
        text: 'Camera',
        onPress: async () => {
          const granted = await handlePermission('camera');
          if (!granted) return;
          launchCamera({ mediaType: 'photo', quality: 1 }, (res: ImagePickerResponse) => {
            const assets = (res.assets ?? []) as Asset[];
            if (assets.length > 0) setImages(prev => [...prev, assets[0]]);
          });
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const granted = await handlePermission('gallery');
          if (!granted) return;
          launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (res: ImagePickerResponse) => {
            const assets = (res.assets ?? []) as Asset[];
            if (assets.length > 0) setImages(prev => [...prev, ...assets]);
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, index) => index !== i));
  };

  const submitProduct = async () => {
    if (isLoading) return;

    if (!name.trim() || !description.trim() || !price || images.length === 0 || !resolvedAddress) {
      return Alert.alert('Missing fields', 'Please complete all fields.');
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return Alert.alert('Invalid Price', 'Price must be a positive number.');
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('location[name]', resolvedAddress);
    formData.append('location[latitude]', latitude.toString());
    formData.append('location[longitude]', longitude.toString());

    images.forEach((img, i) => {
      if (img.uri) {
        formData.append('images', {
          uri: Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
          name: img.fileName || `photo_${i}.jpg`,
          type: img.type || 'image/jpeg',
        } as any);
      }
    });

    try {
      await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      Alert.alert('✅ Success', 'Product added!');
      setName('');
      setDescription('');
      setPrice('');
      setImages([]);
      setResolvedAddress('');
      setSearchQuery('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload product.';
      Alert.alert('❌ Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#111' : '#fff' }]}>
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Product Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        value={name}
        onChangeText={setName}
        placeholder="Enter product name"
        placeholderTextColor={isDarkMode ? '#888' : '#666'}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Describe your product"
        placeholderTextColor={isDarkMode ? '#888' : '#666'}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Price</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
        placeholderTextColor={isDarkMode ? '#888' : '#666'}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>📍 Location</Text>
      <View style={styles.locationRow}>
        <TextInput
          style={[styles.locationInput, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search location..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          onSubmitEditing={searchLocation}
        />
        <TouchableOpacity onPress={searchLocation} style={styles.searchButton}>
          <Text style={styles.searchText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={navigateToMapPicker} style={styles.mapButton}>
        <Text style={styles.mapButtonText}>🗺️ Pick on Map</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleChooseImage} style={styles.imagePicker}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>📸 Upload Images</Text>
      </TouchableOpacity>

      <View style={styles.imageList}>
        {images.map((img, i) => (
          <TouchableOpacity key={`${img.uri}-${i}`} onLongPress={() => removeImage(i)}>
            <Image source={{ uri: img.uri }} style={styles.image} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={submitProduct} style={styles.submitButton}>
        {isLoading ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          </>
        ) : (
          <Text style={styles.submitText}>Submit Product</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: 'bold', fontSize: 15, marginBottom: 5 },
  input: { borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  multiline: { height: 80, textAlignVertical: 'top' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  locationInput: { flex: 1, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#ccc' },
  searchButton: { padding: 10, backgroundColor: '#007AFF', borderRadius: 8 },
  searchText: { color: '#fff' },
  mapButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  mapButtonText: { color: '#fff', fontWeight: '600' },
  imagePicker: { borderColor: '#ccc', borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  imageList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  image: { width: 80, height: 80, borderRadius: 8 },
  submitButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontWeight: 'bold' },
  progressText: { color: '#fff', marginTop: 5, fontSize: 12 },
});

export default AddProductScreen;
