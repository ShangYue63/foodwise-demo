import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { useImpact } from '../context/ImpactContext';

const ImpactScreen = () => {
  const insets = useSafeAreaInsets();
  const impact = useImpact();
  const [timeRange, setTimeRange] = useState('monthly');
  const data = impact[timeRange];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.headerTitle}>🌍 Our Impact</Text>
        <Text style={styles.headerSubtext}>Together, we're making a difference</Text>
      </View>

      <View style={styles.timeRangeRow}>
        {['daily', 'weekly', 'monthly'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statNumber}>{data.mealsSaved}</Text>
          <Text style={styles.statLabel}>Meals Saved</Text>
          <Text style={styles.statIcon}>🍽️</Text>
        </View>
        <View style={[styles.statCard, styles.statCardOrange]}>
          <Text style={styles.statNumber}>{data.co2Saved}kg</Text>
          <Text style={styles.statLabel}>CO₂ Saved</Text>
          <Text style={styles.statIcon}>🌱</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statNumber}>{data.vendors}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
          <Text style={styles.statIcon}>🏪</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPurple]}>
          <Text style={styles.statNumber}>{impact.monthly.mealsSaved}</Text>
          <Text style={styles.statLabel}>Total Meals</Text>
          <Text style={styles.statIcon}>📊</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  header: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.white },
  headerSubtext: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  timeRangeRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, gap: 8 },
  timeRangeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.gray, alignItems: 'center' },
  timeRangeButtonActive: { backgroundColor: colors.primary },
  timeRangeText: { fontSize: 14, fontWeight: '600', color: colors.grayDark },
  timeRangeTextActive: { color: colors.white },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, position: 'relative', overflow: 'hidden' },
  statCardGreen: { borderTopColor: colors.primary, borderTopWidth: 4 },
  statCardOrange: { borderTopColor: colors.secondary, borderTopWidth: 4 },
  statCardBlue: { borderTopColor: '#2196F3', borderTopWidth: 4 },
  statCardPurple: { borderTopColor: '#9C27B0', borderTopWidth: 4 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: colors.dark, marginTop: 4 },
  statLabel: { fontSize: 12, color: colors.grayDark, marginTop: 2 },
  statIcon: { fontSize: 24, marginTop: 4 },
});

export default ImpactScreen;