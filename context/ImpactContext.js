import React, { createContext, useState, useContext, useCallback } from 'react';
import { impactData } from '../data/mockData';

const ImpactContext = createContext();

export const useImpact = () => useContext(ImpactContext);

// Helper to check if a timestamp falls within a given time range
const isInRange = (timestamp, range) => {
  const date = new Date(timestamp);
  const now = new Date();

  switch (range) {
    case 'daily': {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }
    case 'weekly': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    case 'monthly': {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }
    default:
      return true;
  }
};

// Compute aggregates for a time range from the order history
const computeRange = (orders, range, baseline) => {
  const filtered = orders.filter((o) => isInRange(o.timestamp, range));
  const mealsSaved = filtered.reduce((sum, o) => sum + o.mealsSaved, 0) + baseline.mealsSaved;
  const co2Saved = Math.round((filtered.reduce((sum, o) => sum + o.co2Saved, 0) + baseline.co2Saved) * 10) / 10;
  const uniqueVendors = new Set(filtered.map((o) => o.vendorName));
  const vendorBaseline = baseline.vendors;
  return {
    mealsSaved,
    co2Saved,
    vendors: Math.max(vendorBaseline, uniqueVendors.size + vendorBaseline),
  };
};

export const ImpactProvider = ({ children }) => {
  // Baseline from mock data – these represent "historical" totals
  // We separate them so new orders only affect the non-baseline portion
  const baseline = {
    daily: { mealsSaved: impactData.daily.mealsSaved, co2Saved: impactData.daily.co2Saved, vendors: impactData.daily.vendors },
    weekly: { mealsSaved: impactData.weekly.mealsSaved, co2Saved: impactData.weekly.co2Saved, vendors: impactData.weekly.vendors },
    monthly: { mealsSaved: impactData.monthly.mealsSaved, co2Saved: impactData.monthly.co2Saved, vendors: impactData.monthly.vendors },
  };

  // We also seed a few past orders so weekly/monthly show realistic non-zero data
  const seedOrders = [
    { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, mealsSaved: 3, co2Saved: 1.5, vendorName: 'Kedai Kopi JB' },
    { timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, mealsSaved: 2, co2Saved: 1.0, vendorName: "Baker's Delight" },
    { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, mealsSaved: 4, co2Saved: 2.0, vendorName: 'Mamak Corner' },
    { timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, mealsSaved: 5, co2Saved: 2.5, vendorName: 'Sushi Express' },
    { timestamp: Date.now() - 40 * 24 * 60 * 60 * 1000, mealsSaved: 10, co2Saved: 5.0, vendorName: 'Green Garden Cafe' },
  ];

  const [orderHistory, setOrderHistory] = useState(seedOrders);

  const addImpact = useCallback((quantity, vendorName) => {
    const mealsSaved = quantity;
    const co2Saved = quantity * 0.5; // approx 0.5kg CO₂ saved per meal

    setOrderHistory((prev) => [
      ...prev,
      { timestamp: Date.now(), mealsSaved, co2Saved, vendorName },
    ]);
  }, []);

  const getDaily = () => computeRange(orderHistory, 'daily', baseline.daily);
  const getWeekly = () => computeRange(orderHistory, 'weekly', baseline.weekly);
  const getMonthly = () => computeRange(orderHistory, 'monthly', baseline.monthly);

  const value = {
    daily: getDaily(),
    weekly: getWeekly(),
    monthly: getMonthly(),
    addImpact,
  };

  return (
    <ImpactContext.Provider value={value}>
      {children}
    </ImpactContext.Provider>
  );
};