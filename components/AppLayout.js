import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import HomeScreen from '../screens/HomeScreen';
import LocationSelectionModal from './LocationSelection';

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check for user location on component mount
  useEffect(() => {
    const checkUserLocation = async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem('user');
        
        if (storedUserJson) {
          let storedUser = JSON.parse(storedUserJson);
          setUser(storedUser);
          
          // If location not available, show the location modal
          if (!storedUser.latitude || !storedUser.longitude) {
            setLocationModalVisible(true);
          }
        } else {
          // No user data stored yet, create one and show location modal
          const newUser = { id: Date.now().toString() };
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          setLocationModalVisible(true);
        }
      } catch (error) {
        console.error('Error checking user location:', error);
      }
    };
    
    checkUserLocation();
  }, []);

  // Function to handle location modal close and update
  const handleLocationUpdate = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
    setLocationModalVisible(false);
  };

  // Function to open location modal manually
  const openLocationModal = () => {
    setLocationModalVisible(true);
  };

  // Function to render the content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      // case 'Search':
      //   return <SearchScreen />;
      // case 'Profile':
      //   return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Bizz</Text>

        <View style={styles.iconContainer}>
          {/* Location Icon */}
          <TouchableOpacity style={styles.iconButton} onPress={openLocationModal}>
            <Ionicons name="location-outline" size={24} color="#333" />
          </TouchableOpacity>

          {/* Modern Message Icon (Chat Bubble) */}
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#333" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area - Direct rendering without ScrollView wrapper */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]} 
          onPress={() => setActiveTab('Home')}
        >
          <Ionicons 
            name={activeTab === 'Home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'Home' ? '#000000' : '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Search' && styles.activeNavItem]} 
          onPress={() => setActiveTab('Search')}
        >
          <Ionicons 
            name={activeTab === 'Search' ? 'search' : 'search-outline'} 
            size={24} 
            color={activeTab === 'Search' ? '#000000' : '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Search' && styles.activeNavText]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Profile' && styles.activeNavItem]} 
          onPress={() => setActiveTab('Profile')}
        >
          <Ionicons 
            name={activeTab === 'Profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'Profile' ? '#000000' : '#555'} 
          />
          <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Selection Modal */}
      <LocationSelectionModal 
        visible={locationModalVisible} 
        onClose={handleLocationUpdate} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconButton: {
    marginLeft: 15,
    position: 'relative',
  },
  
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    height: 30,
    width: 120,
  },
  messageIcon: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  navText: {
    fontSize: 11,
    marginTop: 1,
    color: '#555',
  },
  activeNavText: {
    color: '#000000',
    fontWeight: '600',
  },
});

export default AppLayout;