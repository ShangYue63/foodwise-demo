import React, { createContext, useState, useContext, useCallback } from 'react';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = useCallback((order) => {
    setOrders(prev => [...prev, {
      ...order,
      status: 'Pending',
    }]);
  }, []);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }, []);

  const getOrdersByVendor = useCallback((vendorName) => {
    return orders.filter(o => o.vendorName === vendorName);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrdersByVendor }}>
      {children}
    </OrdersContext.Provider>
  );
};