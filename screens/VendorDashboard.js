import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { useListings } from '../context/ListingContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

const VendorDashboard = ({ navigation, onLogout }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { listings, addListing, updateListing } = useListings();
  const { orders, updateOrderStatus } = useOrders();
  const vendorName = user?.name || 'Your Store';

  const vendorListings = listings.filter(l => l.vendorName === vendorName);

  // Show all orders in this demo (single device, no backend)
  const vendorOrders = orders;

  const totalOrdersCount = vendorOrders.length;
  const pendingCount = vendorOrders.filter(o => o.status === 'Pending' || o.status === 'Ready').length;
  const totalRevenue = vendorOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const vendorStats = {
    totalListings: vendorListings.length,
    totalOrders: totalOrdersCount,
    pendingPickups: pendingCount,
    revenue: totalRevenue,
  };

  const recentOrders = vendorOrders.map(o => ({
    id: o.id,
    customer: o.customerName || 'Customer',
    items: `${o.listing?.foodName || 'Item'} × ${o.quantity}`,
    status: o.status,
    time: new Date(o.pickupTime).toLocaleString(),
    _raw: o,
  }));

  const [modalVisible, setModalVisible] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [modalFoodName, setModalFoodName] = useState('');
  const [modalPrice, setModalPrice] = useState('');
  const [modalPickupStart, setModalPickupStart] = useState('');
  const [modalPickupEnd, setModalPickupEnd] = useState('');
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenAddModal = () => {
    setEditingListing(null);
    setModalFoodName('');
    setModalPrice('');
    setModalPickupStart('');
    setModalPickupEnd('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setModalFoodName(listing.foodName);
    setModalPrice(String(listing.price));
    setModalPickupStart(listing.pickupStart || '');
    setModalPickupEnd(listing.pickupEnd || '');
    setModalVisible(true);
  };

  const handleSaveListing = () => {
    if (!modalFoodName.trim() || !modalPrice.trim()) return;

    const price = parseFloat(modalPrice);
    if (isNaN(price) || price < 0) return;

    const today = getTodayString();

    let pickupStart = modalPickupStart.trim();
    let pickupEnd = modalPickupEnd.trim();

    if (pickupStart && !pickupStart.includes('-')) {
      pickupStart = `${today} ${pickupStart}`;
    }
    if (pickupEnd && !pickupEnd.includes('-')) {
      pickupEnd = `${today} ${pickupEnd}`;
    }

    if (editingListing) {
      updateListing(editingListing.id, {
        foodName: modalFoodName.trim(),
        price,
        ...(pickupStart ? { pickupStart } : {}),
        ...(pickupEnd ? { pickupEnd } : {}),
      });
    } else {
      const newListing = {
        id: Date.now().toString(),
        vendorName: vendorName,
        vendorImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=50&h=50&fit=crop&crop=face',
        foodName: modalFoodName.trim(),
        description: 'Fresh and delicious!',
        category: 'Halal',
        priceTier: 'discounted',
        price: price,
        originalPrice: Math.round(price * 2),
        quantity: 10,
        pickupStart: pickupStart || `${today} 18:00`,
        pickupEnd: pickupEnd || `${today} 19:00`,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
        isBlindBox: false,
        distance: '0.0 km',
      };
      addListing(newListing);
    }

    setModalVisible(false);
    setModalFoodName('');
    setModalPrice('');
    setModalPickupStart('');
    setModalPickupEnd('');
    setEditingListing(null);
  };

  const handleCancelModal = () => {
    setModalVisible(false);
    setModalFoodName('');
    setModalPrice('');
    setModalPickupStart('');
    setModalPickupEnd('');
    setEditingListing(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.vendorHeader, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.vendorTitle}>{vendorName}</Text>
          <Text style={styles.vendorSubtitle}>Vendor Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.vendorScroll}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="restaurant" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{vendorStats.totalListings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="receipt" size={24} color={colors.secondary} />
            <Text style={styles.statNumber}>{vendorStats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="time" size={24} color="#1565C0" />
            <Text style={styles.statNumber}>{vendorStats.pendingPickups}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
            <Ionicons name="cash" size={24} color="#C62828" />
            <Text style={styles.statNumber}>RM{vendorStats.revenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyListingsText}>No orders yet. Orders placed by customers will appear here.</Text>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => {
                  setSelectedOrder(order);
                  setPickupModalVisible(true);
                }}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderCustomer}>{order.customer}</Text>
                  <Text style={styles.orderItems}>{order.items}</Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                <View style={[styles.orderStatus, 
                  { backgroundColor: order.status === 'Pending' ? '#FFF3E0' : 
                    order.status === 'Ready' ? '#E8F5E9' : '#F5F5F5' }]}>
                  <Text style={[styles.orderStatusText, 
                    { color: order.status === 'Pending' ? colors.secondary : 
                      order.status === 'Ready' ? colors.success : colors.grayDark }]}>
                    {order.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Listings</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
          {vendorListings.length === 0 ? (
            <Text style={styles.emptyListingsText}>No listings yet. Tap "Add New" to create one!</Text>
          ) : (
            vendorListings.map((listing) => (
              <View key={listing.id} style={styles.vendorListingItem}>
                <View style={styles.vendorListingInfo}>
                  <Text style={styles.vendorListingName}>{listing.foodName}</Text>
                  <Text style={styles.vendorListingMeta}>RM{listing.price.toFixed(2)} · {listing.quantity} left</Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEditModal(listing)}>
                  <Ionicons name="pencil" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingListing ? 'Edit Food Item' : 'Add New Food Item'}
            </Text>

            <Text style={styles.modalLabel}>Food Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Nasi Lemak"
              placeholderTextColor="#999"
              value={modalFoodName}
              onChangeText={setModalFoodName}
            />

            <Text style={styles.modalLabel}>Price (RM)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 4.00"
              placeholderTextColor="#999"
              value={modalPrice}
              onChangeText={setModalPrice}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Pickup Start Time (HH:MM)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 18:00"
              placeholderTextColor="#999"
              value={modalPickupStart}
              onChangeText={setModalPickupStart}
            />

            <Text style={styles.modalLabel}>Pickup End Time (HH:MM)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 19:00"
              placeholderTextColor="#999"
              value={modalPickupEnd}
              onChangeText={setModalPickupEnd}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveListing}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pickup Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pickupModalVisible}
        onRequestClose={() => setPickupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickupModalContent}>
            <View style={styles.pickupModalHeader}>
              <Text style={styles.pickupModalTitle}>Pickup Details</Text>
              <TouchableOpacity onPress={() => setPickupModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.grayDark} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={[styles.pickupStatusBadge,
                  { backgroundColor: selectedOrder.status === 'Pending' ? '#FFF3E0' :
                    selectedOrder.status === 'Ready' ? '#E8F5E9' : '#F5F5F5' }]}>
                  <Ionicons
                    name={selectedOrder.status === 'Pending' ? 'time' : selectedOrder.status === 'Ready' ? 'checkmark-circle' : 'checkmark-done'}
                    size={20}
                    color={selectedOrder.status === 'Pending' ? colors.secondary :
                      selectedOrder.status === 'Ready' ? colors.success : colors.grayDark}
                  />
                  <Text style={[styles.pickupStatusText,
                    { color: selectedOrder.status === 'Pending' ? colors.secondary :
                      selectedOrder.status === 'Ready' ? colors.success : colors.grayDark }]}>
                    {selectedOrder.status}
                  </Text>
                </View>

                <View style={styles.pickupDetailRow}>
                  <Ionicons name="person-outline" size={18} color={colors.grayDark} />
                  <Text style={styles.pickupDetailLabel}>Customer</Text>
                  <Text style={styles.pickupDetailValue}>{selectedOrder.customer}</Text>
                </View>
                <View style={styles.pickupDetailRow}>
                  <Ionicons name="receipt-outline" size={18} color={colors.grayDark} />
                  <Text style={styles.pickupDetailLabel}>Order ID</Text>
                  <Text style={styles.pickupDetailValue}>{selectedOrder.id}</Text>
                </View>
                <View style={styles.pickupDetailRow}>
                  <Ionicons name="cart-outline" size={18} color={colors.grayDark} />
                  <Text style={styles.pickupDetailLabel}>Items</Text>
                  <Text style={styles.pickupDetailValue}>{selectedOrder.items}</Text>
                </View>
                <View style={styles.pickupDetailRow}>
                  <Ionicons name="time-outline" size={18} color={colors.grayDark} />
                  <Text style={styles.pickupDetailLabel}>Ordered</Text>
                  <Text style={styles.pickupDetailValue}>{selectedOrder.time}</Text>
                </View>

                {/* Status-based action buttons */}
                {selectedOrder.status === 'Pending' && (
                  <TouchableOpacity
                    style={[styles.pickupActionButton, { backgroundColor: colors.success, marginTop: 20 }]}
                    onPress={() => {
                      const orderId = selectedOrder._raw ? selectedOrder._raw.id : selectedOrder.id;
                      updateOrderStatus(orderId, 'Ready');
                      setPickupModalVisible(false);
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
                    <Text style={styles.pickupActionText}>Mark as Ready</Text>
                  </TouchableOpacity>
                )}
                {selectedOrder.status === 'Ready' && (
                  <>
                    <TouchableOpacity
                      style={[styles.pickupActionButton, { backgroundColor: colors.primary, marginTop: 20 }]}
                      onPress={() => {
                        setPickupModalVisible(false);
                        const raw = selectedOrder._raw || selectedOrder;
                        navigation.navigate('VendorScanner', { expectedOrder: raw });
                      }}
                    >
                      <Ionicons name="scan-outline" size={20} color={colors.white} />
                      <Text style={styles.pickupActionText}>Scan QR Code to Confirm Pickup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pickupActionButton, { backgroundColor: '#1565C0', marginTop: 12 }]}
                      onPress={() => {
                        const orderId = selectedOrder._raw ? selectedOrder._raw.id : selectedOrder.id;
                        updateOrderStatus(orderId, 'Picked Up');
                        setPickupModalVisible(false);
                      }}
                    >
                      <Ionicons name="hand-left-outline" size={20} color={colors.white} />
                      <Text style={styles.pickupActionText}>Mark as Picked Up (Manual)</Text>
                    </TouchableOpacity>
                  </>
                )}
                {selectedOrder.status === 'Picked Up' && (
                  <View style={[styles.pickupActionButton, { backgroundColor: '#E8F5E9', marginTop: 20, justifyContent: 'center' }]}>
                    <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
                    <Text style={[styles.pickupActionText, { color: colors.success }]}>Order Completed</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  vendorHeader: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vendorTitle: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  vendorSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  vendorScroll: { flex: 1 },
  logoutButton: { padding: 8 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, marginBottom: 8, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.dark, marginTop: 8 },
  statLabel: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  sectionCard: { backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 12, marginBottom: 12, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.dark, marginBottom: 12 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray },
  orderLeft: { flex: 1 },
  orderCustomer: { fontSize: 15, fontWeight: '600', color: colors.dark },
  orderItems: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  orderTime: { fontSize: 12, color: '#999', marginTop: 2 },
  orderStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  orderStatusText: { fontSize: 12, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  addButtonText: { fontSize: 14, color: colors.primary, fontWeight: '500', marginLeft: 4 },
  vendorListingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray },
  vendorListingInfo: { flex: 1 },
  vendorListingName: { fontSize: 15, fontWeight: '500', color: colors.dark },
  vendorListingMeta: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  editButton: { padding: 8 },
  emptyListingsText: { fontSize: 14, color: colors.grayDark, textAlign: 'center', paddingVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.dark, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 16, backgroundColor: colors.gray },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalCancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.gray, marginRight: 8, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: colors.grayDark },
  modalSaveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, marginLeft: 8, alignItems: 'center' },
  modalSaveText: { fontSize: 16, fontWeight: '600', color: colors.white },
  pickupModalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  pickupModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickupModalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.dark },
  pickupStatusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, marginBottom: 16, gap: 6 },
  pickupStatusText: { fontSize: 16, fontWeight: 'bold' },
  pickupDetailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray, gap: 8 },
  pickupDetailLabel: { fontSize: 14, color: colors.grayDark, flex: 1, marginLeft: 4 },
  pickupDetailValue: { fontSize: 14, color: colors.dark, fontWeight: '500', textAlign: 'right' },
  pickupActionButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 8 },
  pickupActionText: { fontSize: 15, fontWeight: '600', color: colors.white },
});

export default VendorDashboard;