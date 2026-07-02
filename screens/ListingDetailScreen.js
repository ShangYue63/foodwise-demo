import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import Button from '../components/Button';

const ListingDetailScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { foodName, vendorName, description, price, originalPrice, image, pickupStart, pickupEnd, isBlindBox, priceTier, category, quantity: maxQuantity, distance } = listing;

  const getPriceTagColor = () => priceTier === 'free' ? colors.success : priceTier === 'special' ? colors.secondary : colors.primary;
  const getPriceLabel = () => priceTier === 'free' ? 'FREE' : priceTier === 'special' ? 'SPECIAL PRICE' : 'DISCOUNTED';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={[styles.image, isBlindBox && styles.blindBoxImage]}
          resizeMode={isBlindBox ? 'contain' : 'cover'}
        />
        {isBlindBox && <View style={styles.blindBoxBadge}><Text style={styles.blindBoxText}>🎁 BLIND BOX</Text></View>}
        <View style={[styles.priceBadge, { backgroundColor: getPriceTagColor() }]}><Text style={styles.priceBadgeText}>{getPriceLabel()}</Text></View>
        {expired && (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredOverlayText}>PICKUP WINDOW CLOSED</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.foodName, expired && styles.textExpired]}>{foodName}</Text>
          <View style={styles.priceContainer}>
            {originalPrice > 0 && <Text style={styles.originalPrice}>RM{originalPrice.toFixed(2)}</Text>}
            <Text style={styles.price}>{price === 0 ? 'FREE' : `RM${price.toFixed(2)}`}</Text>
          </View>
        </View>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}><Ionicons name="storefront" size={16} color={colors.grayDark} /><Text style={styles.metaText}>{vendorName}</Text></View>
          <View style={styles.metaItem}><Ionicons name="location" size={16} color={colors.grayDark} /><Text style={styles.metaText}>{distance}</Text></View>
          {pickupStart && pickupEnd && (
            <View style={styles.metaItem}><Ionicons name="time" size={16} color={colors.grayDark} /><Text style={styles.metaText}>Pickup: {formatTimeRange(pickupStart, pickupEnd)}</Text></View>
          )}
        </View>
        {isBlindBox && (
          <View style={styles.blindBoxInfo}>
            <Ionicons name="gift" size={24} color={colors.secondary} />
            <Text style={styles.blindBoxInfoText}>Surprise! You'll receive a selection of {foodName}</Text>
          </View>
        )}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.divider} />
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Ionicons name="remove" size={24} color={colors.primary} /></TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}><Ionicons name="add" size={24} color={colors.primary} /></TouchableOpacity>
            <Text style={styles.quantityAvailable}>{maxQuantity} available</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {expired ? (
            <View style={styles.expiredMessage}>
              <Ionicons name="alert-circle" size={20} color={colors.grayDark} />
              <Text style={styles.expiredMessageText}>This item's pickup window has closed</Text>
            </View>
          ) : (
            <Button title="Reserve Food" onPress={() => navigation.navigate('Cart', { listing, quantity })} variant="primary" />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 280, backgroundColor: colors.gray },
  blindBoxImage: { backgroundColor: '#FFF3E0' },
  blindBoxBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  blindBoxText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  priceBadge: { position: 'absolute', bottom: 16, left: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24 },
  priceBadgeText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  expiredOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  expiredOverlayText: { color: colors.white, fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  foodName: { fontSize: 24, fontWeight: 'bold', color: colors.dark, flex: 1, marginRight: 12 },
  textExpired: { color: colors.grayDark },
  priceContainer: { alignItems: 'flex-end' },
  originalPrice: { fontSize: 16, color: colors.grayDark, textDecorationLine: 'line-through' },
  price: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  metaInfo: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  metaText: { fontSize: 14, color: colors.grayDark, marginLeft: 4 },
  blindBoxInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12, marginBottom: 16 },
  blindBoxInfoText: { fontSize: 14, color: colors.secondary, marginLeft: 12, flex: 1 },
  divider: { height: 1, backgroundColor: colors.gray, marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.dark, marginBottom: 8 },
  description: { fontSize: 16, color: colors.dark, lineHeight: 24 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 20, fontWeight: '600', color: colors.dark, marginHorizontal: 16, minWidth: 30, textAlign: 'center' },
  quantityAvailable: { fontSize: 14, color: colors.grayDark, marginLeft: 12 },
  buttonContainer: { marginTop: 24, marginBottom: 20 },
  expiredMessage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: colors.gray, borderRadius: 12 },
  expiredMessageText: { fontSize: 14, color: colors.grayDark, marginLeft: 8, fontWeight: '500' },
});

export default ListingDetailScreen;