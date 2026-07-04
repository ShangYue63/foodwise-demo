import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { useListings } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';

const VendorDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { listings } = useListings();
  const { orders } = useOrders();
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

  return (
    <View style={styles.container}>
      <View style={[styles.vendorHeader, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer()}>
          <Ionicons name="menu" size={28} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.vendorTitle}>{vendorName}</Text>
          <Text style={styles.vendorSubtitle}>Vendor Dashboard</Text>
        </View>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  vendorHeader: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 4, marginRight: 12 },
  headerTextContainer: { flex: 1 },
  vendorTitle: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  vendorSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  vendorScroll: { flex: 1 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, marginBottom: 8, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.dark, marginTop: 8 },
  statLabel: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
});

export default VendorDashboardScreen;