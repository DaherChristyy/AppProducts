// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Text,
//   Alert,
//   Platform,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../types/types';

// const DEFAULT_COORDS = { latitude: 33.8938, longitude: 35.5018 };

// type MapPickerRouteProp = RouteProp<RootStackParamList, 'MapPicker'>;
// type MapPickerNavigationProp = StackNavigationProp<RootStackParamList, 'MapPicker'>;

// const MapPickerScreen = () => {
//   const mapRef = useRef<MapView | null>(null);
//   const navigation = useNavigation<MapPickerNavigationProp>();
//   const route = useRoute<MapPickerRouteProp>();

//   const [selectedLocation, setSelectedLocation] = useState(
//     route.params?.initialLocation || DEFAULT_COORDS
//   );
//   const [searchQuery, setSearchQuery] = useState('');
//   const [address, setAddress] = useState('');
//   const [isLoadingAddress, setIsLoadingAddress] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   const reverseGeocode = async (lat: number, lng: number) => {
//     setIsLoadingAddress(true);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
//         {
//           headers: {
//             'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
//           },
//         }
//       );

//       if (!res.ok) {
//         const errorText = await res.text();
//         setAddress('Unable to retrieve address (API error)');
//         return;
//       }

//       const data = await res.json();
//       const { name, road, house_number, suburb, city, town, village, state, country } =
//         data.address || {};

//       const readable = [
//         name,
//         `${house_number || ''} ${road || ''}`.trim(),
//         suburb,
//         city || town || village,
//         state,
//         country,
//       ]
//         .filter(Boolean)
//         .join(', ');

//       setAddress(readable || data.display_name || 'Unknown location');
//     } catch (err) {
//       setAddress('Unable to retrieve address');
//     } finally {
//       setIsLoadingAddress(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedLocation.latitude && selectedLocation.longitude) {
//       reverseGeocode(selectedLocation.latitude, selectedLocation.longitude);
//     }
//   }, [selectedLocation]);

//   const handleMapPress = (e: any) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     setSelectedLocation({ latitude, longitude });
//   };

//   const handleConfirm = () => {
//     const dataToReturn = {
//       latitude: selectedLocation.latitude,
//       longitude: selectedLocation.longitude,
//       address,
//     };

//     if (route.params?.onSelect) {
//       route.params.onSelect(dataToReturn);
//       navigation.goBack();
//     } else {
//       navigation.navigate('AddProduct', { selectedLocation: dataToReturn });
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       Alert.alert('Search Input', 'Please enter a location to search.');
//       return;
//     }

//     setIsSearching(true);
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//           searchQuery
//         )}&format=json&limit=1&accept-language=en`,
//         {
//           headers: {
//             'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         Alert.alert('Error', 'Failed to search for location (API error).');
//         return;
//       }

//       const results = await response.json();
//       if (results.length > 0) {
//         const { lat, lon } = results[0];
//         const coords = {
//           latitude: parseFloat(lat),
//           longitude: parseFloat(lon),
//         };
//         setSelectedLocation(coords);
//         mapRef.current?.animateToRegion({
//           ...coords,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
//       } else {
//         Alert.alert('Not Found', `No results found for "${searchQuery}".`);
//       }
//     } catch (e) {
//       Alert.alert('Error', 'Could not search location. Please try again.');
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchRow}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for a location..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity
//           onPress={handleSearch}
//           style={styles.searchButton}
//           disabled={isSearching}
//         >
//           {isSearching ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.searchButtonText}>Search</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           latitude: selectedLocation.latitude,
//           longitude: selectedLocation.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//         region={{
//           latitude: selectedLocation.latitude,
//           longitude: selectedLocation.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//         onPress={handleMapPress}
//         showsUserLocation={false}
//         showsMyLocationButton={false}
//       >
//         <Marker coordinate={selectedLocation} />
//       </MapView>

//       <View style={styles.addressContainer}>
//         {isLoadingAddress ? (
//           <ActivityIndicator size="small" color="#007AFF" />
//         ) : (
//           <Text style={styles.addressText}>
//             {address ? `Address: ${address}` : 'Resolving address...'}
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
//         <Text style={styles.confirmText}>Confirm Location</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   searchRow: {
//     flexDirection: 'row',
//     padding: 10,
//     gap: 8,
//     backgroundColor: '#f2f2f2',
//     alignItems: 'center',
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     height: 40,
//   },
//   searchButton: {
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   addressContainer: {
//     padding: 12,
//     backgroundColor: '#fafafa',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'center',
//   },
//   confirmButton: {
//     backgroundColor: '#28a745',
//     padding: 15,
//     borderRadius: 0,
//     alignItems: 'center',
//   },
//   confirmText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default MapPickerScreen;
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

const DEFAULT_COORDS = { latitude: 33.8938, longitude: 35.5018 };

type MapPickerRouteProp = RouteProp<RootStackParamList, 'MapPicker'>;
type MapPickerNavigationProp = StackNavigationProp<RootStackParamList, 'MapPicker'>;

const MapPickerScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const navigation = useNavigation<MapPickerNavigationProp>();
  const route = useRoute<MapPickerRouteProp>();

  const [selectedLocation, setSelectedLocation] = useState(
    route.params?.initialLocation || DEFAULT_COORDS
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (daherchristy1@gmail.com)',
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        setAddress('Unable to retrieve address (API error)');
        return;
      }

      const data = await res.json();
      const {
        name,
        road,
        house_number,
        suburb,
        city,
        town,
        village,
        state,
        country,
      } = data.address || {};

      const readable = [
        name,
        `${house_number || ''} ${road || ''}`.trim(),
        suburb,
        city || town || village,
        state,
        country,
      ]
        .filter(Boolean)
        .join(', ');

      setAddress(readable || data.display_name || 'Unknown location');
    } catch (err) {
      setAddress('Unable to retrieve address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  useEffect(() => {
    reverseGeocode(selectedLocation.latitude, selectedLocation.longitude);
  }, [selectedLocation]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    const dataToReturn = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address,
    };

    if (route.params?.onSelect) {
      route.params.onSelect(dataToReturn);
      navigation.goBack();
    } else {
      navigation.navigate('AddProduct', { selectedLocation: dataToReturn });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Input', 'Please enter a location to search.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (daherchristy1@gmail.com)',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert('Error', 'Failed to search for location (API error).');
        return;
      }

      const results = await response.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const coords = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
        setSelectedLocation(coords);
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert('Not Found', `No results found for "${searchQuery}".`);
      }
    } catch (e) {
      
      Alert.alert('Error', 'Could not search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 🗺 Map Display */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...selectedLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          ...selectedLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker coordinate={selectedLocation} />
      </MapView>

      {/* 🏠 Address Resolution */}
      <View style={styles.addressContainer}>
        {isLoadingAddress ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.addressText}>
            {address ? `📍 ${address}` : 'Resolving address...'}
          </Text>
        )}
      </View>

      {/* ✅ Confirm Location Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>✅ Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 40,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addressContainer: {
    padding: 12,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapPickerScreen;
