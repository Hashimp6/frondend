// components/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [store, setStore] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if user is seller and has store data
    if (user?.role === "seller" && user?.storeId) {
      setIsSeller(true);
      
      // Retrieve store data (assuming it's stored in user object)
      // In a real app, you might want to store this separately or as part of the user object
      setStore(user.store || {
        storeName: "Your Store",
        description: "Store description",
        place: "Location",
        category: "Category",
        phone: "Phone Number",
        profileImage: null,
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to login screen will be handled by AuthContext
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBecomeSeller = () => {
    navigation.navigate("NewStore");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.profileSection}>
        <Text style={styles.label}>Username:</Text>
        <Text>{user.username || "N/A"}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text>{user.email}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text>{user.role || "user"}</Text>
      </View>

      {!isSeller && (
        <TouchableOpacity style={styles.button} onPress={handleBecomeSeller}>
          <Text style={styles.buttonText}>Become a Seller</Text>
        </TouchableOpacity>
      )}

      {isSeller && store && (
        <View style={styles.sellerSection}>
          <Text style={styles.heading}>Your Store</Text>

          <Text style={styles.label}>Store Name:</Text>
          <Text>{store.storeName}</Text>

          <Text style={styles.label}>Description:</Text>
          <Text>{store.description}</Text>

          <Text style={styles.label}>Place:</Text>
          <Text>{store.place}</Text>

          <Text style={styles.label}>Category:</Text>
          <Text>{store.category}</Text>

          <Text style={styles.label}>Phone:</Text>
          <Text>{store.phone}</Text>

          {store.profileImage && (
            <Image
              source={{ uri: store.profileImage }}
              style={styles.image}
            />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
  },
  profileSection: {
    marginBottom: 20,
  },
  sellerSection: {
    marginTop: 20,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  image: {
    height: 120,
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
  },
});

export default ProfileScreen;