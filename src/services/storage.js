const ORDERS_KEY = 'freshjuice_orders';

export const storage = {
  // Get all orders
  getOrders: () => {
    try {
      const orders = localStorage.getItem(ORDERS_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  },

  // Get order by ID
  getOrderById: (orderId) => {
    const orders = storage.getOrders();
    return orders.find(order => order.id === orderId);
  },

  // Save new order
  saveOrder: (order) => {
    try {
      const orders = storage.getOrders();
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      return false;
    }
  },

  // Update order status
  updateOrderStatus: (orderId, status) => {
    try {
      const orders = storage.getOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  },

  // Delete order
  deleteOrder: (orderId) => {
    try {
      const orders = storage.getOrders();
      const filteredOrders = orders.filter(order => order.id !== orderId);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders));
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },

  // Clear all orders (for demo/testing)
  clearAllOrders: () => {
    try {
      localStorage.removeItem(ORDERS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing orders:', error);
      return false;
    }
  }
};
