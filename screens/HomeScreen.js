import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import SellerCard from '../components/SellersProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SERVER_URL } from '../config';

const HomeScreen = ({ userLocation, locationUpdateTrigger }) => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

 

  const fetchNearbyStores = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Use the userLocation prop if available, otherwise fall back to AsyncStorage
      let latitude, longitude;
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Use the props passed from parent component
        latitude = userLocation.latitude;
        longitude = userLocation.longitude;
        console.log("Using location from props:", latitude, longitude);
      } else {
        // Fall back to AsyncStorage if props are not available
        const storedUserJson = await AsyncStorage.getItem('user');
        if (!storedUserJson) {
          throw new Error('User data not found');
        }
    
        let storedUser = JSON.parse(storedUserJson);
        
        // If location not available, add default coordinates
        if (!storedUser.latitude || !storedUser.longitude) {
          storedUser.latitude = 9.9312;
          storedUser.longitude = 76.2673;
        }
        
        latitude = storedUser.latitude;
        longitude = storedUser.longitude;
      }
  
      // Make API call to get nearby stores
      const response = await axios.get(
        `${SERVER_URL}/stores/nearby?latitude=${latitude}&longitude=${longitude}`
      );
      console.log("stores are",response.data );
      
      // Update state with fetched stores
      setStores(response.data.stores);
    } catch (err) {
      console.error('Error fetching nearby stores:', err);
      setError(err.message || 'Failed to fetch nearby stores');
      Alert.alert(
        'Error',
        'Failed to load nearby stores. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Log when userLocation or locationUpdateTrigger changes
  useEffect(() => {
    console.log('Location updated:', userLocation);
    console.log('Trigger value:', locationUpdateTrigger);
    fetchNearbyStores();
  }, [userLocation, locationUpdateTrigger]);

  // Pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNearbyStores();
  };

  // Render each store item
  const renderStoreItem = ({ item }) => {
    const distanceText =
      item.distance?.value && typeof item.distance.value === 'number'
        ? `${item.distance.value.toFixed(1)} km`
        : '0 km';
  
    const locationText =
      item.place ||
      (item.location?.coordinates
        ? `${item.location.coordinates[1].toFixed(4)}, ${item.location.coordinates[0].toFixed(4)}`
        : 'Unknown location');
  
    return (
      <SellerCard
        image={item.profileImage || "https://images.unsplash.com/photo-1600891964599-f61ba0e24092"}
        name={item.storeName}
        rating={`${item.rating || '0'} (${item.reviewCount || '0'})`}
        location={locationText}
        distance={distanceText}
        category={item.category || 'Uncategorized'}
        price={item.price || '₹0'}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading nearby stores...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchNearbyStores}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stores.length > 0 ? stores : []}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.storesList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No stores found nearby</Text>
              <Text style={styles.emptySubText}>Try changing your location or check back later</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  storesList: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;