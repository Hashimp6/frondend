import React from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
// Remove ThemeContext import if you haven't created it yet

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import NewChatScreen from '../screens/NewChatScreen';
import HomeScreen from '../screens/HomeScreen';
import NewStore from '../screens/NewStoreScreen';
import AppLayout from '../components/AppLayout';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Use system color scheme directly if ThemeContext doesn't exist yet
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Show loading screen while checking authentication status
  if (authLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#121212' : '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
      </View>
    );
  }
  
  // Common screen options for consistent theming
  const screenOptions = {
    headerStyle: {
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      elevation: 0, // for Android
      shadowOpacity: 0, // for iOS
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0',
    },
    headerTintColor: isDarkMode ? '#FFFFFF' : '#121212',
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 18,
    },
  };

  // Stack for screens that don't require authentication
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }
  
  // Stack for screens that require authentication
  return (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
        name="Home"
        component={AppLayout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NewStore" 
        component={NewStore} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="NewChat"
        component={NewChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;