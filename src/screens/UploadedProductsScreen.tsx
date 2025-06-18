import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import API from '../api/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, Product } from '../types/types';

const { width } = Dimensions.get('window');

const UploadedProductsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUploadedProducts = useCallback(async () => {
    if (!user?.email) {
      setError('User not logged in or email not available. Please log in.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const res = await API.get('/products', {
        params: { userEmail: user.email },
      });

      const rawProducts = res.data.data || [];
      const filtered = rawProducts.filter(
        (product: Product) => product.user?.email === user.email && !product.isDeleted
      );

      setProducts(filtered);
    } catch (err: any) {
      console.error('❌ Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load your products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchUploadedProducts();
    }, [fetchUploadedProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUploadedProducts();
  }, [fetchUploadedProducts]);

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = item.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image';

    return (
      <TouchableOpacity
        style={[styles.productItem, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}
        onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={[styles.itemTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>{item.name}</Text>
          <Text style={[styles.itemPrice, { color: isDarkMode ? '#ADD8E6' : '#007AFF' }]}>
            ${item.price?.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const textColor = isDarkMode ? '#fff' : '#000';
  const bgColor = isDarkMode ? '#111' : '#f0f2f5';

  if (loading && products.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: textColor, marginTop: 10 }}>Loading your products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUploadedProducts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#222' : '#F0F2F5' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.backButton}>
          <Text style={[styles.backButtonSymbol, { color: textColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Your Uploaded Products</Text>
        <View style={{ width: 30 }} />
      </View>

      {products.length === 0 ? (
        <View style={[styles.centered, { flex: 1, backgroundColor: bgColor }]}>
          <Text style={{ color: textColor, fontSize: 18 }}>
            You haven't uploaded any products yet.
          </Text>
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text style={styles.addProductButtonText}>Upload Your First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContentContainer}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#007AFF' : '#007AFF'}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 30 : 60, 
    paddingBottom: 15, 
    marginBottom: 10,  
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  backButtonSymbol: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingRight: 8,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  productItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxWidth: width / 2 - 10,
  },
  productImage: {
    width: '100%',
    height: width * 0.4,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addProductButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default UploadedProductsScreen;
