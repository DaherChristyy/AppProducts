import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types/types';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://backend-practice.eurisko.me';

const NewPostsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { token } = useAuth();
  const authToken = token;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!authToken) {
      setError('Authentication token not available. Please log in.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const currentPage = reset ? 1 : page;
    const limit = 10;

    try {
      if (reset) {
        setLoading(true);
        setPosts([]);
      } else if (page > 1) {
        setLoading(true);
      }

      setError(null);

      const response = await axios.get(`${BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: currentPage, limit },
      });

      const newPosts: Post[] = response.data.data;

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const filtered = newPosts.filter(p => !existingIds.has(p._id));
        return reset ? newPosts : [...prev, ...filtered];
      });

      setPage(currentPage + 1);
      setHasMore(newPosts.length === limit);
    } catch (err: any) {
      console.error('❌ Fetch Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load posts.');
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, hasMore, authToken]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const renderPostItem = ({ item }: { item: Post }) => {
    const postImageUrl = item.image_url
      ? item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`
      : 'https://via.placeholder.com/150?text=No+Image';

    return (
      <TouchableOpacity
        style={[
          styles.postItem,
          { backgroundColor: isDarkMode ? '#222' : '#FFF' },
          styles.shadowStyle,
        ]}
        onPress={() =>
          item.link
            ? Linking.openURL(item.link).catch(err => console.error("Link error", err))
            : Alert.alert("No Link", "This post has no URL.")
        }
      >
        <Image source={{ uri: postImageUrl }} style={styles.postImage} />
        <View style={styles.postContent}>
          <Text style={[styles.postTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>{item.title}</Text>
          {!!item.description && (
            <Text style={[styles.postDescription, { color: isDarkMode ? '#CCC' : '#555' }]} numberOfLines={3}>
              {item.description}
            </Text>
          )}
          <Text style={[styles.postSource, { color: isDarkMode ? '#AAA' : '#888' }]}>
            Source: {item.source_id}
          </Text>
          <Text style={[styles.postDate, { color: isDarkMode ? '#888' : '#AAA' }]}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const textColor = isDarkMode ? '#fff' : '#000';
  const bgColor = isDarkMode ? '#111' : '#f0f2f5';

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: textColor, marginTop: 10 }}>Loading latest posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginHorizontal: 20 }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts(true)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: isDarkMode ? '#222' : '#F0F2F5' }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>📰 Latest Posts</Text>
      </View>

      {posts.length === 0 && !loading && !refreshing ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <Text style={{ color: textColor, fontSize: 18 }}>No posts found.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContentContainer}
          onEndReached={() => {
            if (!loading && hasMore && posts.length > 0) {
              fetchPosts();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator style={{ marginVertical: 16 }} size="small" /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 70, 
    paddingBottom: 20, 
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    },
    headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10, 
    },

  listContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  postItem: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postImage: {
    width: width * 0.3,
    aspectRatio: 1,
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  postContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 13,
    marginBottom: 5,
  },
  postSource: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  postDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 5,
    alignSelf: 'flex-end',
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

export default NewPostsScreen;
