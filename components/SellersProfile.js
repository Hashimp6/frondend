// FoodCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // for message icon (you need expo install)

const SellerCard = ({ image, name, rating, location, category, price, time, offer }) => {
  return (
    <TouchableOpacity style={styles.card}>
      {/* Food Image */}
      <Image source={{ uri: image }} style={styles.image} />

      {/* Store Info */}
      <View style={styles.info}>
        {/* Top Row: Name and Rating */}
        <View style={styles.topRow}>
          <Text style={styles.title}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFA500" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location}>{location}</Text>

        {/* Bottom Row: Category and Message Icon */}
        <View style={styles.bottomRow}>
          {category && <Text style={styles.category}>{category}</Text>}

          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
    marginHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#A9A9A9',
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 20,
  },
});

export default SellerCard;
