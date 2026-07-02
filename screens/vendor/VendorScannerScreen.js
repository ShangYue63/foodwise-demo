import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../styles/colors';
import { useOrders } from '../../context/OrdersContext';

const VendorScannerScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { expectedOrder } = route.params || {};
  const { updateOrderStatus } = useOrders();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(100);

    const orderQrCode = expectedOrder?.qrCode || expectedOrder?.id;
    const isMatch = data === orderQrCode;

    if (isMatch) {
      setScanResult('success');
      // Update order status in shared context
      if (expectedOrder?.id) {
        updateOrderStatus(expectedOrder.id, 'Picked Up');
      }
      setTimeout(() => {
        // Navigate back and pass the updated order status
        navigation.navigate('VendorOrderDetail', {
          order: { ...expectedOrder, status: 'Picked Up' },
          scanned: true,
        });
      }, 1500);
    } else {
      setScanResult('error');
      setTimeout(() => {
        setScanned(false);
        setScanResult(null);
      }, 2000);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.grayDark} />
          <Text style={styles.permissionText}>Camera access is required to scan QR codes</Text>
          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={scannerRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: 'transparent' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Customer QR Code</Text>
        </View>

        {/* Scan overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            {scanResult === 'success' && (
              <View style={styles.resultOverlay}>
                <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                <Text style={styles.resultText}>Verified!</Text>
              </View>
            )}
            {scanResult === 'error' && (
              <View style={styles.resultOverlay}>
                <Ionicons name="close-circle" size={80} color={colors.danger} />
                <Text style={styles.resultText}>Code Mismatch</Text>
              </View>
            )}
            {!scanResult && (
              <>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <Text style={styles.scanHint}>Align QR code within the frame</Text>
              </>
            )}
          </View>
        </View>

        {/* Order info at bottom */}
        {!scanResult && expectedOrder && (
          <View style={styles.orderInfoBar}>
            <Ionicons name="receipt-outline" size={18} color={colors.white} />
            <Text style={styles.orderInfoText}>
              Scanning for: {expectedOrder.id} • {expectedOrder.customer || expectedOrder.customerName}
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  camera: { flex: 1 },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white, flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  permissionText: { fontSize: 16, color: colors.grayDark, textAlign: 'center' },
  grantButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  grantButtonText: { fontSize: 16, fontWeight: '600', color: colors.white },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.white,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  scanHint: { position: 'absolute', bottom: -40, color: colors.white, fontSize: 14, textAlign: 'center', opacity: 0.8 },
  resultOverlay: { alignItems: 'center', gap: 12 },
  resultText: { fontSize: 20, fontWeight: 'bold', color: colors.white },
  orderInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    gap: 8,
  },
  orderInfoText: { fontSize: 14, color: colors.white, fontWeight: '500' },
});

export default VendorScannerScreen;