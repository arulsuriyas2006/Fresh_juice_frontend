// Use Railway backend in production, localhost in development
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://freshjuice-production.up.railway.app/api'
  : 'http://localhost:5000/api';

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: async (userData) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  },

  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
  },

  logout: () => {
    localStorage.removeItem('user');
  },
};

// Loyalty API
export const loyaltyAPI = {
  getPoints: async (email) => {
    const data = await apiRequest(`/loyalty/points/${email}`);
    return data;
  },

  addPoints: async (email, points) => {
    const data = await apiRequest('/loyalty/add-points', {
      method: 'POST',
      body: JSON.stringify({ email, points }),
    });
    return data;
  },

  redeemPoints: async (email, points) => {
    const data = await apiRequest('/loyalty/redeem-points', {
      method: 'POST',
      body: JSON.stringify({ email, points }),
    });
    return data;
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderData) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async () => {
    return await apiRequest('/orders');
  },

  getOrderById: async (orderId) => {
    return await apiRequest(`/orders/${orderId}`);
  },

  updateOrderStatus: async (orderId, status) => {
    return await apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  deleteOrder: async (orderId) => {
    return await apiRequest(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  },
};
