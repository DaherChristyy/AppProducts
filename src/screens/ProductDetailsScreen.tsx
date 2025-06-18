import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator,
  TouchableOpacity, Alert, FlatList, Linking, RefreshControl, PermissionsAndroid,
  Platform, Share,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../types/types';
import API from '../api/axiosInstance';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import ImageViewing from 'react-native-image-viewing';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://backend-practice.eurisko.me';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
};

const isOwnedByUser = (productUser: any, currentUser: any): boolean => {
  if (!productUser || !currentUser) return false;
  return productUser._id === currentUser._id || productUser.email?.toLowerCase() === currentUser.email?.toLowerCase();
};

const ProductDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get(`/products/${productId}`);
      const data = res.data.data;
      setProduct({ ...data, name: data.name || 'Unnamed Product', images: data.images || [] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useFocusEffect(useCallback(() => { fetchProduct(); }, [fetchProduct]));

  const saveImage = async (url: string) => {
    const granted = await requestStoragePermission();
    if (!granted) return Toast.show({ type: 'error', text1: 'Storage permission denied' });

    const fileName = url.split('/').pop();
    const path = `${RNFS.PicturesDirectoryPath}/${fileName}`;
    try {
      Toast.show({ type: 'info', text1: 'Saving image...' });
      const res = await RNFS.downloadFile({ fromUrl: `${BASE_URL}${url}`, toFile: path }).promise;
      if (res.statusCode === 200) {
        if (Platform.OS === 'android') RNFS.scanFile(path);
        Toast.show({ type: 'success', text1: 'Saved to gallery' });
      } else throw new Error('Failed');
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save image' });
    }
  };

  const saveAllImages = async () => {
    if (!product?.images?.length) return;
    for (const img of product.images) await saveImage(img.url);
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${product?.name}\n${BASE_URL}/products/${productId}`,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Share failed' });
    }
  };

  const addToCart = () => {
    Toast.show({ type: 'success', text1: '🛒 Added to cart (mock)' });
  };

  const handleDelete = () => {
    Alert.alert('Delete product?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await API.delete(`/products/${productId}`);
            Toast.show({ type: 'success', text1: 'Deleted successfully' });
            navigation.goBack();
          } catch {
            Toast.show({ type: 'error', text1: 'Delete failed' });
          }
        }
      }
    ]);
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() =>
      Alert.alert('Error', 'Could not open email app.')
    );
  };

  const isMyProduct = isOwnedByUser(product?.user, user);
  const textColor = isDarkMode ? '#fff' : '#000';
  const subTextColor = isDarkMode ? '#ccc' : '#444';
  const bgColor = isDarkMode ? '#111' : '#fff';
  const borderColor = isDarkMode ? '#333' : '#eee';

  if (isLoading) {
    return <View style={[styles.loading, { backgroundColor: bgColor }]}><ActivityIndicator color="#007AFF" /></View>;
  }

  if (error || !product) {
    return (
      <View style={[styles.loading, { backgroundColor: bgColor }]}>
        <Text style={{ color: 'red' }}>{error || 'No product found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: bgColor }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProduct} />}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backFloating}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <FlatList
        data={product.images}
        horizontal
        pagingEnabled
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => { setViewerIndex(index); setViewerVisible(true); }} onLongPress={() => saveImage(item.url)}>
            <Image source={{ uri: `${BASE_URL}${item.url}` }} style={styles.image} />
          </TouchableOpacity>
        )}
        style={{ height: 300 }}
      />

      <ImageViewing
        images={product.images.map(img => ({ uri: `${BASE_URL}${img.url}` }))}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />

      <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>{product.name}</Text>
        <Text style={[styles.price, { color: '#007AFF' }]}>${product.price.toFixed(2)}</Text>
        <Text style={[styles.description, { color: subTextColor }]}>{product.description}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.actionBtn} onPress={shareProduct}>
            <Text style={styles.actionText}>🔗 Share</Text>
          </TouchableOpacity>

          {!isMyProduct && (
            <TouchableOpacity style={styles.actionBtn} onPress={addToCart}>
              <Text style={styles.actionText}>🛒 Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {isMyProduct && (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#007AFF' }]} onPress={() => navigation.navigate('EditProduct', { product })}>
              <Text style={styles.actionText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DC3545' }]} onPress={handleDelete}>
              <Text style={styles.actionText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {product.images.length > 1 && (
          <TouchableOpacity style={styles.actionBtn} onPress={saveAllImages}>
            <Text style={styles.actionText}>💾 Save All</Text>
          </TouchableOpacity>
        )}
      </View>

      {product.location && (
        <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
          <Text style={[styles.title, { color: textColor }]}>📍 Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: product.location.latitude,
              longitude: product.location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={product.location} title={product.name} />
          </MapView>
          <Text style={[styles.description, { color: subTextColor, marginTop: 8 }]}>
            {product.location.name}
          </Text>
        </View>
      )}

      {product.user && (
        <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
          <Text style={[styles.title, { color: textColor, fontSize: 14 }]}>Seller</Text>
          <View style={styles.sellerRow}>
            <View style={styles.avatar}>
              {product.user.profileImage?.url ? (
                <Image source={{ uri: `${BASE_URL}${product.user.profileImage.url}` }} style={styles.avatarImg} />
              ) : <Text style={{ fontSize: 26 }}>👤</Text>}
            </View>
            <View>
              <Text style={[styles.sellerName, { color: textColor }]}>
                {product.user.firstName} {product.user.lastName}
              </Text>
              <TouchableOpacity onPress={() => sendEmail(product.user!.email)}>
                <Text style={[styles.email, { color: subTextColor }]}>✉️ {product.user.email}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backFloating: { position: 'absolute', top: 50, left: 15, zIndex: 1, backgroundColor: '#0006', padding: 8, borderRadius: 20 },
  backArrow: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  image: { width, height: 300, resizeMode: 'cover' },
  card: { margin: 15, padding: 20, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  price: { fontSize: 18, marginVertical: 6 },
  description: { fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 15 },
  actionBtn: { flex: 1, backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  map: { height: 200, borderRadius: 10, marginTop: 10 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  sellerName: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, textDecorationLine: 'underline' },
  backBtn: { marginTop: 20, backgroundColor: '#007AFF', padding: 10, borderRadius: 6 },
  backBtnText: { color: '#fff' },
});

export default ProductDetailsScreen;
