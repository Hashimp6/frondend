import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';
import { SERVER_URL } from '../config';


const GOOGLE_MAPS_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';

const LocationSelectionModal = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get location suggestions from Google Places API
  const fetchLocationSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setSuggestions(data.predictions);
      } else {
        setError('Failed to get location suggestions');
        setSuggestions([]);
      }
    } catch (err) {
      setError('Network error occurred');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchLocationSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get coordinates from place_id
  const getCoordinatesFromPlaceId = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result && data.result.geometry && data.result.geometry.location) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng
        };
      }
      throw new Error('Could not get coordinates');
    } catch (err) {
      setError('Failed to get location coordinates');
      return null;
    }
  };

  // Handle location selection
  const handleSelectLocation = async (item) => {
    try {
      setLoading(true);
      
      // Get coordinates for the selected place
      const coordinates = await getCoordinatesFromPlaceId(item.place_id);
      
      if (coordinates) {
        // Get the stored user data
        const storedUserJson = await AsyncStorage.getItem('user');
        let storedUser = storedUserJson ? JSON.parse(storedUserJson) : {};
        
        // Update user with new coordinates and location name
        const updatedUser = {
          ...storedUser,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          locationName: item.description
        };
        
        try {
          // ✅ Send location update to backend
          const userId=storedUser._id
          await axios.put(`${SERVER_URL}/users/location/${userId}`, {
            coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON format
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedUser.token}`, // only if using auth
            },
          });
      
          // Save updated user data locally
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
        } catch (apiError) {
          console.error("Failed to update location on server:", apiError);
          setError('Failed to update location on server');
        }
        
        // Close the modal and pass back the selected location data
        onClose(updatedUser);
      }
    } catch (err) {
      setError('Failed to save location');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle getting current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Get address from coordinates (reverse geocoding)
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      // Format the address for display
      let locationName = 'Current Location';
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        locationName = [
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
      }
      
      // Get the stored user data
      const storedUserJson = await AsyncStorage.getItem('user');
      let storedUser = storedUserJson ? JSON.parse(storedUserJson) : {};
      
      // Update user with new coordinates and location name
      const updatedUser = {
        ...storedUser,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationName
      };
      
      try {
        // Send location update to backend
        await axios.put(`${SERVER_URL}/users/location/${storedUser._id}`, {
          coordinates: [location.coords.longitude, location.coords.latitude], // GeoJSON format
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedUser.token}`, // only if using auth
          },
        });
        
        // Save updated user data back to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
      } catch (apiError) {
        console.error("Failed to update location on server:", apiError);
        setError('Failed to update location on server');
      }
      
      // Close the modal and pass back the selected location data
      onClose(updatedUser);
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Ionicons name="location-outline" size={20} color="#555" style={styles.locationIcon} />
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Location</Text>
            <TouchableOpacity onPress={() => onClose()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Please select your location to see nearest stores
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
          >
            <Ionicons name="locate" size={18} color="#007AFF" />
            <Text style={styles.currentLocationText}>Use my current location</Text>
          </TouchableOpacity>
          
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
          ) : (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  suggestionsList: {
    maxHeight: '60%',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
});

export default LocationSelectionModal;