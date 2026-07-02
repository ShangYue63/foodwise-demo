import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';

const ListingCard = ({ listing, onPress }) => {
  const { foodName, vendorName, price, originalPrice, image, pickupStart, pickupEnd, isBlindBox, priceTier, distance } = listing;

  const getPriceTagColor = () => {
    if (priceTier === 'free') return colors.success;
    if (priceTier === 'special') return colors.secondary;
    return colors.primary;
  };

  const getPriceLabel = () => {
    if (priceTier === 'free') return 'FREE';
    if (priceTier === 'special') return 'SPECIAL';
    return 'DISCOUNTED';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeRange = (start, end) => {
    const startStr = formatTime(start);
    const endStr = formatTime(end);
    return `${startStr} - ${endStr}`;
  };

  const isExpired = () => {
    if (!pickupEnd) return false;
    return new Date() > new Date(pickupEnd);
  };

  const expired = isExpired();

  return (
    <TouchableOpacity style={[styles.card, expired && styles.cardExpired]} onPress={onPress} activeOpacity={0.8} disabled={expired}>
      <Image 
        source={typeof image === 'string' ? { uri: image } : image} 
        style={[styles.image, isBlindBox && styles.blindBoxImage]}
        resizeMode={isBlindBox ? 'contain' : 'cover'}
      />
      {isBlindBox && (
        <View style={styles.blindBoxBadge}>
          <Text style={styles.blindBoxText}>🎁 BLIND BOX</Text>
        </View>
      )}
      {expired && (
        <View style={styles.expiredOverlay}>
          <Text style={styles.expiredText}>EXPIRED</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.foodName, expired && styles.textExpired]} numberOfLines={1}>{foodName}</Text>
          <View style={[styles.priceTag, { backgroundColor: getPriceTagColor() }]}>
            <Text style={styles.priceTagText}>{getPriceLabel()}</Text>
          </View>
        </View>
        <Text style={[styles.vendorName, expired && styles.textExpired]}>{vendorName}</Text>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {originalPrice > 0 && <Text style={styles.originalPrice}>RM{originalPrice.toFixed(2)}</Text>}
            <Text style={styles.price}>{price === 0 ? 'FREE' : `RM${price.toFixed(2)}`}</Text>
          </View>
          <View style={styles.metaContainer}>
            {pickupStart && pickupEnd && (
              <Text style={[styles.metaText, expired && styles.textExpired]}>⏱ {formatTimeRange(pickupStart, pickupEnd)}</Text>
            )}
            <Text style={[styles.metaText, expired && styles.textExpired]}>📍 {distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
  cardExpired: { opacity: 0.6 },
  image: { width: '100%', height: 180, backgroundColor: colors.gray },
  blindBoxImage: { backgroundColor: '#FFF3E0' },
  blindBoxBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  blindBoxText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },
  expiredOverlay: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  expiredText: { color: colors.white, fontWeight: 'bold', fontSize: 11 },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  foodName: { fontSize: 18, fontWeight: 'bold', color: colors.dark, flex: 1, marginRight: 8 },
  textExpired: { color: colors.grayDark },
  priceTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priceTagText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
  vendorName: { fontSize: 14, color: colors.grayDark, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  originalPrice: { fontSize: 14, color: colors.grayDark, textDecorationLine: 'line-through', marginRight: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  metaContainer: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: colors.grayDark, marginLeft: 12 },
});

export default ListingCard;