import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Image,
  Dimensions, ActivityIndicator, RefreshControl, Alert, StatusBar, Platform, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import API from '../api/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, Product } from '../types/types';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://backend-practice.eurisko.me';

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const { logout, user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = useCallback(async (reset = false) => {
    const source = axios.CancelToken.source();

    if (reset && !loadingInitial) setLoadingInitial(true);
    else if (!reset && !loadingMore) setLoadingMore(true);
    setIsRefreshing(false);

    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        sortBy: 'price',
        order: sortAsc ? 'asc' : 'desc',
        limit: 10,
      };

      const res = debouncedSearch.trim()
        ? await API.get('/products/search', {
            params: { ...params, query: debouncedSearch.trim() },
            cancelToken: source.token,
          })
        : await API.get('/products', {
            params,
            cancelToken: source.token,
          });

      const newProducts: Product[] = res.data.data.map((p: any) => ({
        _id: p._id,
        name: p.title,
        description: p.description,
        price: p.price,
        location: p.location
          ? {
              name: p.location.address,
              latitude: p.location.latitude,
              longitude: p.location.longitude,
            }
          : undefined,
        images: p.images || [],
        user: p.user,
        isDeleted: p.isDeleted,
      }));

      if (reset) {
        setProducts(newProducts);
        setPage(2);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          return [...prev, ...newProducts.filter((p) => !existingIds.has(p._id))];
        });
        setPage((prev) => prev + 1);
      }
      setHasMore(newProducts.length === params.limit);
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        Alert.alert('Error', 'Failed to load products. Please try again.');
        setHasMore(false);
      }
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }

    return () => source.cancel();
  }, [debouncedSearch, page, sortAsc, loadingInitial, loadingMore]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setIsRefreshing(true);
    fetchProducts(true);
  }, [debouncedSearch, sortAsc]);

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

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {
          backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
          borderColor: isDarkMode ? '#444' : '#E0E0E0',
        },
      ]}
      onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
    >
      {item.images[0]?.url ? (
        <Image source={{ uri: BASE_URL + item.images[0].url }} style={styles.itemImage} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
          <Text style={{ color: isDarkMode ? '#BBB' : '#888' }}>No Image</Text>
        </View>
      )}
      <Text style={[styles.itemTitle, { color: isDarkMode ? '#E0E0E0' : '#333' }]}>{item.name}</Text>
      <Text style={[styles.itemPrice, { color: isDarkMode ? '#8BC34A' : '#4CAF50' }]}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) ?? '';
    const last = user?.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  };

  const userProfileImage = user?.profileImage?.url
    ? `${BASE_URL}${user.profileImage.url}`
    : '';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F8F8F8' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8' }]}>
        <Text style={[styles.screenTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Products</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          {userProfileImage ? (
            <Image source={{ uri: userProfileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#666', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>
                {getInitials()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchSortContainer}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          style={[
            styles.searchInput,
            {
              color: isDarkMode ? '#E0E0E0' : '#333',
              backgroundColor: isDarkMode ? '#222' : '#FFF',
              borderColor: isDarkMode ? '#444' : '#E0E0E0',
            },
          ]}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          onPress={() => setSortAsc(prev => !prev)}
          style={[styles.sortButton, { backgroundColor: isDarkMode ? '#444' : '#DDD' }]}
        >
          <Text style={{ fontSize: 13, color: isDarkMode ? '#EEE' : '#333' }}>
            Sort: {sortAsc ? '↑ Price' : '↓ Price'}
          </Text>
        </TouchableOpacity>
      </View>

      {loadingInitial && products.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={isDarkMode ? '#90CAF9' : '#007AFF'} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          onEndReached={() => !loadingMore && hasMore && fetchProducts()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                setPage(1);
                setHasMore(true);
                fetchProducts(true);
              }}
              tintColor="#007AFF"
            />
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            !loadingInitial && products.length === 0 && !loadingMore ? (
              <View style={styles.emptyListContainer}>
                <Text style={{ color: isDarkMode ? '#AAA' : '#666' }}>No products found.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContainer, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('ProfileScreen'); }} style={styles.menuItemButton}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#E0E0E0' : '#333' }]}>👤 Manage Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('UploadedProducts'); }} style={styles.menuItemButton}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#E0E0E0' : '#333' }]}>📦 My Products</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.menuItemButton}>
              <Text style={[styles.menuItemText, { color: 'red' }]}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  screenTitle: { fontSize: 28, fontWeight: 'bold' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 10,
  },
  sortButton: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  row: { justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 5 },
  itemContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: width * 0.4,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: width * 0.4,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  menuItemButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 18,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});

export default ProductListScreen;
