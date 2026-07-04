import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorListingsScreen from '../screens/vendor/VendorListingsScreen';
import VendorOrderDetailScreen from '../screens/vendor/VendorOrderDetailScreen';
import VendorScannerScreen from '../screens/vendor/VendorScannerScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = 280;

const SCREENS = {
  VendorDashboard: { component: VendorDashboardScreen, inDrawer: true, label: 'Dashboard', icon: 'grid-outline' },
  VendorOrders: { component: VendorOrdersScreen, inDrawer: true, label: 'Orders', icon: 'receipt-outline' },
  VendorListings: { component: VendorListingsScreen, inDrawer: true, label: 'Listings', icon: 'list-outline' },
  VendorOrderDetail: { component: VendorOrderDetailScreen, inDrawer: false },
  VendorScanner: { component: VendorScannerScreen, inDrawer: false },
};

const CustomDrawerContent = ({ activeRoute, onNavigate, onLogout, insets }) => {
  const { logout } = useAuth();

  const menuItems = Object.entries(SCREENS)
    .filter(([, config]) => config.inDrawer)
    .map(([name, config]) => ({ name, ...config }));

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Ionicons name="storefront" size={40} color={colors.white} />
        <Text style={styles.drawerTitle}>FoodWise</Text>
        <Text style={styles.drawerSubtitle}>Vendor Panel</Text>
      </View>
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onNavigate(item.name)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.primary : colors.grayDark}
              />
              <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VendorDrawerNavigator = ({ navigation: parentNavigation, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [routeStack, setRouteStack] = useState([{ name: 'VendorDashboard', params: {} }]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const focusListenersRef = useRef({});

  const currentRoute = routeStack[routeStack.length - 1];

  const notifyFocus = useCallback((routeName) => {
    const listeners = focusListenersRef.current[routeName];
    if (listeners) {
      listeners.forEach((cb) => cb());
    }
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, overlayAnim]);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [drawerOpen, openDrawer, closeDrawer]);

  const navigate = useCallback((name, params = {}) => {
    if (!SCREENS[name]) {
      console.warn(`[VendorDrawerNavigator] Unknown screen: ${name}`);
      return;
    }
    // If navigating to a drawer root screen, reset the stack to it
    if (SCREENS[name].inDrawer) {
      setRouteStack([{ name, params }]);
      // Notify focus after state update
      setTimeout(() => notifyFocus(name), 0);
    } else {
      setRouteStack((prev) => [...prev, { name, params }]);
      setTimeout(() => notifyFocus(name), 0);
    }
    closeDrawer();
  }, [closeDrawer, notifyFocus]);

  const goBack = useCallback(() => {
    setRouteStack((prev) => {
      if (prev.length <= 1) return prev;
      const newStack = prev.slice(0, -1);
      const prevRoute = newStack[newStack.length - 1];
      setTimeout(() => notifyFocus(prevRoute.name), 0);
      return newStack;
    });
  }, [notifyFocus]);

  const reset = useCallback((state) => {
    // Used for logout - navigate back to the root stack
    if (state && state.routes && state.routes[0]) {
      if (parentNavigation) {
        parentNavigation.reset({ index: 0, routes: [{ name: state.routes[0].name }] });
      } else if (onLogout) {
        onLogout();
      }
    }
  }, [parentNavigation, onLogout]);

  const addListener = useCallback((eventName, callback) => {
    if (eventName !== 'focus') return { remove: () => {} };
    const routeName = currentRoute.name;
    if (!focusListenersRef.current[routeName]) {
      focusListenersRef.current[routeName] = new Set();
    }
    focusListenersRef.current[routeName].add(callback);
    return {
      remove: () => {
        focusListenersRef.current[routeName]?.delete(callback);
      },
    };
  }, [currentRoute.name]);

  const navigation = {
    toggleDrawer,
    navigate,
    goBack,
    reset,
    addListener,
    getState: () => ({ routes: routeStack, index: routeStack.length - 1 }),
    setOptions: () => {},
  };

  // Notify focus on initial mount
  useEffect(() => {
    notifyFocus('VendorDashboard');
  }, [notifyFocus]);

  const ScreenComponent = SCREENS[currentRoute.name]?.component;

  const handleDrawerNavigate = (name) => {
    navigate(name);
  };

  const handleLogoutFromDrawer = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Screen */}
      <View style={styles.screenContainer}>
        {ScreenComponent ? (
          <ScreenComponent
            navigation={navigation}
            route={{ name: currentRoute.name, params: currentRoute.params }}
          />
        ) : null}
      </View>

      {/* Overlay */}
      {drawerOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeDrawer}
        >
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <CustomDrawerContent
          activeRoute={SCREENS[currentRoute.name]?.inDrawer ? currentRoute.name : null}
          onNavigate={handleDrawerNavigate}
          onLogout={handleLogoutFromDrawer}
          insets={insets}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  screenContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.white,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  menuContainer: {
    paddingTop: 16,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#E8F5E9',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark,
    marginLeft: 16,
  },
  menuItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    padding: 16,
    paddingBottom: 32,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.danger,
    marginLeft: 16,
  },
});

export default VendorDrawerNavigator;