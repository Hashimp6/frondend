import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SERVER_URL } from '../config';

// Create the auth context
const AuthContext = createContext();

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load stored authentication data when the app starts
  useEffect(() => {
    async function loadStoredAuthData() {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Set default auth header for all axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load authentication data', e);
      } finally {
        setLoading(false);
      }
    }
    
    loadStoredAuthData();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${SERVER_URL}/users/login`, {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store authentication data
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      // Set default auth header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(`${SERVER_URL}/users/register`, {
        username,
        email,
        password
      });
      
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Clear state
      setUser(null);
      setToken(null);
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (e) {
      console.error('Logout failed', e);
      return { success: false, message: 'Logout failed' };
    }
  };

  // Get current user info (refresh from server)
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (e) {
      console.error('Failed to get current user', e);
      
      // If unauthorized (token expired), log out
      if (e.response && e.response.status === 401) {
        logout();
      }
      
      return { success: false, message: 'Failed to get user information' };
    } finally {
      setLoading(false);
    }
  };

  // Return the provider with values
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      getCurrentUser,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};