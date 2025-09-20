import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store token and user data
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    console.log('API: login called with', credentials.identifier);
    try {
      console.log('API: making POST request to /auth/login');
      const response = await api.post('/auth/login', credentials);
      console.log('API: received response', response.data);
      
      // Store token and user data
      if (response.data.success && response.data.token) {
        console.log('API: storing token and user data');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('API: login error', error);
      console.error('API: error response', error.response?.data);
      const errorData = error.response?.data || { success: false, message: 'Network error - please check if backend is running' };
      throw errorData;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user data' };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Profile update failed' };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Password change failed' };
    }
  },
};

// User management API functions (Admin only)
export const userAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch users' };
    }
  },

  // Get user by ID
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch user' };
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create user' };
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update user' };
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete user' };
    }
  },

  // Activate user
  activateUser: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to activate user' };
    }
  },

  // Deactivate user
  deactivateUser: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to deactivate user' };
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch user statistics' };
    }
  },
};

// Finance API functions
export const financeAPI = {
  // Get finance dashboard stats
  getFinanceStats: async () => {
    try {
      const response = await api.get('/finance/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch finance stats' };
    }
  },

  // Bills management
  getBills: async (params = {}) => {
    try {
      const response = await api.get('/finance/bills', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch bills' };
    }
  },

  createBill: async (billData) => {
    try {
      const response = await api.post('/finance/bills', billData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create bill' };
    }
  },

  // Transactions management
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/finance/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch transactions' };
    }
  },

  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/finance/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create transaction' };
    }
  },

  // Payments management
  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/finance/payments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch payments' };
    }
  },

  verifyPayment: async (paymentId) => {
    try {
      const response = await api.put(`/finance/payments/${paymentId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to verify payment' };
    }
  },

  // Billing rates management
  getBillingRates: async (params = {}) => {
    try {
      const response = await api.get('/finance/billing-rates', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch billing rates' };
    }
  },

  createBillingRate: async (rateData) => {
    try {
      const response = await api.post('/finance/billing-rates', rateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create billing rate' };
    }
  },

  updateBillingRate: async (rateId, rateData) => {
    try {
      const response = await api.put(`/finance/billing-rates/${rateId}`, rateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update billing rate' };
    }
  }
};

// Utility functions
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authUtils.getStoredUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return authUtils.hasRole('admin');
  },

  // Check if user is staff (medtech, pathologist, or admin)
  isStaff: () => {
    const user = authUtils.getStoredUser();
    return ['medtech', 'pathologist', 'admin'].includes(user?.role);
  },

  // Clear all stored auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export async function updateUserProfile(data, token) {
  const res = await fetch('/api/users/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export default api;
