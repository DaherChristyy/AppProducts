import React from 'react';
import { FlatList, View, Text, Button, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../context/ThemeContext';  
import products from '../assets/Products.json';

const { width, height } = Dimensions.get('window');

type ProductListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductList'>;

interface ProductListScreenProps {
  navigation: ProductListScreenNavigationProp;
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation }) => {
  const { isDarkMode } = useTheme();

  const renderItem = ({ item }: { item: typeof products.data[0] }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: isDarkMode ? '#444' : '#fff' }]}
      onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
    >
      <Image
        source={{ uri: item.images[0].url }}
        style={[styles.image, { width: width * 0.4, height: height * 0.2 }]}
      />
      <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black' }]}>{item.title}</Text>
      <Text style={[styles.price, { color: isDarkMode ? 'lightgreen' : 'green' }]}>${item.price}</Text>
      <Button title="View Details" onPress={() => navigation.navigate('ProductDetails', { productId: item._id })} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      ListHeaderComponent={<Text style={styles.header}>Products</Text>}
      data={products.data}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  itemContainer: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  image: {
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#2f8e3e',
    marginBottom: 10,
  },
});

export default ProductListScreen;
