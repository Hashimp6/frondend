import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { SERVER_URL } from '../config';
import { useNavigation } from '@react-navigation/native';

const NewStore = () => {
  const navigation = useNavigation();

  // Form state
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageInfo, setImageInfo] = useState(null); // For file info
  const [place, setPlace] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    'Restaurant', 
    'Retail', 
    'Electronics', 
    'Fashion', 
    'Grocery', 
    'Services', 
    'Beauty', 
    'Health', 
    'Home & Decor',
    'Books & Stationery',
    'Sports & Fitness',
    'Entertainment',
    'Other'
  ];

  // Location API configuration
  const LOCATION_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';
  const LOCATION_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  // Handle location input and get suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (place.length > 2) {
        fetchLocationSuggestions();
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [place]);

  const fetchLocationSuggestions = async () => {
    try {
      const response = await axios.get(LOCATION_API_URL, {
        params: {
          input: place,
          key: LOCATION_API_KEY,
          types: 'geocode'
        }
      });
      
      if (response.data.predictions) {
        setLocationSuggestions(response.data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const selectLocation = (description) => {
    setPlace(description);
    setShowSuggestions(false);
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);
        
        // Get file info for upload
        const fileInfo = await FileSystem.getInfoAsync(selectedImageUri);
        const fileExtension = selectedImageUri.split('.').pop();
        
        setImageInfo({
          uri: selectedImageUri,
          name: `store_profile_${Date.now()}.${fileExtension}`,
          type: `image/${fileExtension}`,
          size: fileInfo.size
        });
        
        console.log('Image selected for upload');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error(error);
    }
  };

  const validateForm = () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Store name is required');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please upload a store logo');
      return false;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a store category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      // Create form data
      const formData = new FormData();
  
      if (imageInfo) {
        formData.append('profileImage', {
          uri: imageInfo.uri,
          name: imageInfo.name,
          type: imageInfo.type,
        });
      }
  
      formData.append('storeName', storeName);
      formData.append('description', description);
      formData.append('place', place);
      formData.append('phone', phone);
      formData.append('category', category);
  
      const socialMedia = {
        whatsapp: whatsapp || "",
        instagram: instagram || "",
        facebook: facebook || "",
        website: website || "",
      };
  
      formData.append('socialMedia', JSON.stringify(socialMedia));
  
      const response = await axios.post(
        `${SERVER_URL}/stores/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
  
      if (response.data) {
        Alert.alert('Success', 'Store registered successfully!');
        resetForm();
        navigation.navigate('Home');
      }
  
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to register store');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStoreName('');
    setDescription('');
    setImageUri('');
    setImageInfo(null);
    setPlace('');
    setPhone('');
    setWhatsapp('');
    setInstagram('');
    setFacebook('');
    setWebsite('');
    setCategory('');
  };

  // Render location suggestions as individual touchable items
  const renderLocationSuggestions = () => {
    if (!showSuggestions || locationSuggestions.length === 0) return null;
    
    return (
      <View style={styles.suggestionContainer}>
        {locationSuggestions.map((item) => (
          <TouchableOpacity 
            key={item.place_id}
            style={styles.suggestionItem}
            onPress={() => selectLocation(item.description)}
          >
            <Ionicons name="location-outline" size={16} color="#555" />
            <Text style={styles.suggestionText}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderCategoryModal = () => {
    return (
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item && styles.selectedCategoryItem
                  ]}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === item && styles.selectedCategoryText
                  ]}>
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Register Your Store</Text>
          <Text style={styles.subtitle}>Fill in the details to start selling</Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#888" />
                <Text style={styles.placeholderText}>Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <Text style={styles.uploadSuccess}>Image selected</Text>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name*</Text>
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Enter your store name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your store and what you sell"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category*</Text>
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={category ? styles.categoryValue : styles.categoryPlaceholder}>
                {category || "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={place}
              onChangeText={setPlace}
              placeholder="Enter store location"
              placeholderTextColor="#888"
            />
            {renderLocationSuggestions()}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>Social Media</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="WhatsApp number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="Instagram url"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={facebook}
              onChangeText={setFacebook}
              placeholder="Facebook url"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="Website URL"
              placeholderTextColor="#888"
              keyboardType="url"
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Register Store</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderCategoryModal()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  imagePickerButton: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  uploadSuccess: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Category selector styles
  categorySelector: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryValue: {
    fontSize: 16,
    color: '#000000',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCategoryItem: {
    backgroundColor: '#000000',
  },
  categoryText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  suggestionContainer: {
    position: 'absolute',
    top: 80, // Position below the input field
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewStore;