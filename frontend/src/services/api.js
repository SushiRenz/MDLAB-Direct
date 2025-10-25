import axios from 'axios';

// Dynamic API base URL configuration for network access
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If accessing via IP address (network access), use that IP for API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000/api';
};

// Create axios instance with dynamic base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API configuration for debugging
console.log('🌐 API Service Configuration:', {
  hostname: window.location.hostname,
  baseURL: getApiBaseUrl()
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check both sessionStorage and localStorage for backwards compatibility
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
      // Only logout for authentication-specific 401 errors, not all 401s
      const authPaths = ['/auth/login', '/auth/me', '/auth/logout'];
      const isAuthRequest = authPaths.some(path => error.config?.url?.includes(path));
      
      if (isAuthRequest && error.response?.data?.message?.includes('token')) {
        // Token expired or invalid during auth operations
        console.log('Authentication token failed, logging out:', error.response?.data?.message);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect here - let the component handle it
        // window.location.href = '/login';
      } else {
        // For login attempts with wrong credentials or other 401 errors, don't logout
        console.log('Authorization failed but not redirecting:', error.response?.data?.message);
      }
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
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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
      // Always clear session storage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
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
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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

  deleteBill: async (billId) => {
    try {
      const response = await api.delete(`/finance/bills/${billId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete bill' };
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

  updateTransaction: async (transactionId, transactionData) => {
    try {
      const response = await api.put(`/finance/transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update transaction' };
    }
  },

  deleteTransaction: async (transactionId) => {
    try {
      const response = await api.delete(`/finance/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete transaction' };
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

  // Payments management
  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/finance/payments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch payments' };
    }
  },

  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/finance/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create payment' };
    }
  },

  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await api.put(`/finance/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update payment' };
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const response = await api.delete(`/finance/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete payment' };
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
  },

  deleteBillingRate: async (rateId) => {
    try {
      const response = await api.delete(`/finance/billing-rates/${rateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete billing rate' };
    }
  },

  // Reports management
  generateReport: async (reportType, params = {}) => {
    try {
      const response = await api.post('/finance/reports/generate', {
        reportType,
        ...params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to generate report' };
    }
  },

  getReportsHistory: async (params = {}) => {
    try {
      const response = await api.get('/finance/reports/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch reports history' };
    }
  },

  exportReport: async (reportId, format = 'pdf') => {
    try {
      const response = await api.get(`/finance/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to export report' };
    }
  },

  scheduleReport: async (scheduleData) => {
    try {
      const response = await api.post('/finance/reports/schedule', scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to schedule report' };
    }
  }
};

// Logs API functions
export const logsAPI = {
  // Get system logs with filtering
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch system logs' };
    }
  },

  // Get log statistics
  getLogStats: async () => {
    try {
      const response = await api.get('/logs/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch log statistics' };
    }
  },

  // Create a new log entry
  createLog: async (logData) => {
    try {
      const response = await api.post('/logs', logData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create log entry' };
    }
  },

  // Clean up old logs
  cleanupLogs: async (daysOld = 90) => {
    try {
      const response = await api.delete('/logs/cleanup', {
        data: { daysOld }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to cleanup logs' };
    }
  },

  // Export logs
  exportLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs/export', { 
        params,
        responseType: params.format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to export logs' };
    }
  }
};

// Services API functions
export const servicesAPI = {
  // Get all services with filtering and pagination
  getServices: async (params = {}) => {
    try {
      const response = await api.get('/services', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch services' };
    }
  },

  // Get service statistics (admin only)
  getServiceStats: async () => {
    try {
      const response = await api.get('/services/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch service statistics' };
    }
  },

  // Get popular services (public)
  getPopularServices: async (limit = 10) => {
    try {
      const response = await api.get('/services/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch popular services' };
    }
  },

  // Get service categories (public)
  getServiceCategories: async () => {
    try {
      const response = await api.get('/services/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch service categories' };
    }
  },

  // Get single service by ID (public)
  getServiceById: async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch service' };
    }
  },

  // Create new service (admin only)
  createService: async (serviceData) => {
    try {
      const response = await api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create service' };
    }
  },

  // Update service (admin only)
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update service' };
    }
  },

  // Delete service (admin only) - performs soft delete
  deleteService: async (serviceId) => {
    try {
      const response = await api.delete(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete service' };
    }
  },

  // Toggle service active status (admin only)
  toggleServiceStatus: async (serviceId) => {
    try {
      const response = await api.patch(`/services/${serviceId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to toggle service status' };
    }
  },

  // Toggle service popular status (admin only)
  toggleServicePopular: async (serviceId) => {
    try {
      const response = await api.patch(`/services/${serviceId}/toggle-popular`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to toggle service popular status' };
    }
  },

  // Bulk update services (admin only)
  bulkUpdateServices: async (serviceIds, updateData) => {
    try {
      const response = await api.patch('/services/bulk-update', {
        serviceIds,
        updateData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to bulk update services' };
    }
  }
};

// Utility functions
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const user = sessionStorage.getItem('user') || localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  // Get stored token
  getStoredToken: () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Appointment API functions
export const appointmentAPI = {
  // Get all appointments with filtering
  getAppointments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters if they exist
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/appointments${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get appointments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        error: error.response?.data?.error
      };
    }
  },

  // Get single appointment by ID
  getAppointment: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointment',
        error: error.response?.data?.error
      };
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create appointment error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Enhanced debugging for validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.error('🔍 DETAILED VALIDATION ERRORS:');
        error.response.data.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. Field: ${err.path || err.param || 'unknown'}`);
          console.error(`     Value: ${err.value}`);
          console.error(`     Error: ${err.msg}`);
          console.error(`     Location: ${err.location || 'unknown'}`);
        });
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, updateData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Cancel appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel appointment',
        error: error.response?.data?.error
      };
    }
  },

  // Delete appointment permanently
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Delete appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete appointment',
        error: error.response?.data?.error
      };
    }
  },

  // Check-in patient
  checkInPatient: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/checkin`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Check-in patient error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check in patient',
        error: error.response?.data?.error
      };
    }
  },

  // Check-out patient
  checkOutPatient: async (appointmentId, status = 'completed') => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/checkout`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Check-out patient error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check out patient',
        error: error.response?.data?.error
      };
    }
  },

  // Get appointment statistics
  getAppointmentStats: async (date = null, period = 'day') => {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (period) params.append('period', period);
      
      const queryString = params.toString();
      const url = `/appointments/stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get appointment stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointment statistics',
        error: error.response?.data?.error
      };
    }
  },

  // Get today's appointments
  getTodayAppointments: async (status = null) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const queryString = params.toString();
      const url = `/appointments/today${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get today appointments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch today\'s appointments',
        error: error.response?.data?.error
      };
    }
  },

  // Assign medical staff to appointment
  assignMedicalStaff: async (appointmentId, staffData) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/assign`, staffData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Assign medical staff error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign medical staff',
        error: error.response?.data?.error
      };
    }
  },

  // Register walk-in patient
  registerWalkIn: async (walkInData) => {
    try {
      const appointmentData = {
        ...walkInData,
        type: 'walk-in',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: 'Walk-in'
      };
      
      const response = await api.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Register walk-in error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to register walk-in patient',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Get appointment history for a patient
  getPatientAppointments: async (patientId, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        ...params,
        patientId
      });
      
      const response = await api.get(`/appointments?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get patient appointments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch patient appointments',
        error: error.response?.data?.error
      };
    }
  }
};

// Test Results API functions
export const testResultsAPI = {
  // Get all test results with filtering
  getTestResults: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters if they exist
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/test-results${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get test results error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch test results',
        error: error.response?.data?.error
      };
    }
  },

  // Get single test result by ID
  getTestResult: async (testResultId) => {
    try {
      const response = await api.get(`/test-results/${testResultId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch test result',
        error: error.response?.data?.error
      };
    }
  },

  // Get patient's own released test results
  getMyTestResults: async () => {
    try {
      const response = await api.get('/test-results/my');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get my test results error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your test results',
        error: error.response?.data?.error
      };
    }
  },

  // Mark test result as viewed (patient only)
  markAsViewed: async (testResultId) => {
    try {
      const response = await api.put(`/test-results/${testResultId}/mark-viewed`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Mark as viewed error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark test result as viewed',
        error: error.response?.data?.error
      };
    }
  },

  // Get patient's test results (for patients)
  getPatientTestResults: async (patientId = null, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // If patientId is provided, add it to params
      if (patientId) {
        queryParams.append('patientId', patientId);
      }
      
      // Add other parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/test-results${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get patient test results error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch test results',
        error: error.response?.data?.error
      };
    }
  },

  // Create new test result (MedTech, Pathologist, Admin)
  createTestResult: async (testResultData) => {
    try {
      const response = await api.post('/test-results', testResultData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create test result',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Update test result (MedTech, Pathologist, Admin)
  updateTestResult: async (testResultId, updateData) => {
    try {
      const response = await api.put(`/test-results/${testResultId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update test result',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Get test results by appointment ID
  getTestResultsByAppointment: async (appointmentId) => {
    try {
      const response = await api.get(`/test-results/appointment/${appointmentId}`);
      return {
        success: true,
        data: response.data.testResults,
        services: response.data.services,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get test results by appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch test results for appointment',
        error: error.response?.data?.error
      };
    }
  },

  // Release test result to patient (Pathologist, Admin)
  releaseTestResult: async (testResultId, releaseData = {}) => {
    try {
      const response = await api.put(`/test-results/${testResultId}/release`, releaseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Release test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to release test result',
        error: error.response?.data?.error
      };
    }
  },

  // Get test result statistics (Staff only)
  getTestResultStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/test-results/stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get test result stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch test result statistics',
        error: error.response?.data?.error
      };
    }
  },

  // Approve test result (Pathologist, Admin)
  approveTestResult: async (testResultId, approvalData = {}) => {
    try {
      const response = await api.put(`/test-results/${testResultId}/approve`, approvalData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Approve test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve test result',
        error: error.response?.data?.error
      };
    }
  },

  // Reject test result (Pathologist, Admin)
  rejectTestResult: async (testResultId, rejectionData) => {
    try {
      const response = await api.put(`/test-results/${testResultId}/reject`, rejectionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Reject test result error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reject test result',
        error: error.response?.data?.error
      };
    }
  }
};

// Mobile Lab API functions
export const mobileLabAPI = {
  // Get all mobile lab schedules with filtering
  getMobileLabSchedules: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters if they exist
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/mobile-lab${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get mobile lab schedules error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch mobile lab schedules',
        error: error.response?.data?.error
      };
    }
  },

  // Get current week's mobile lab schedule (public)
  getCurrentWeekSchedule: async () => {
    try {
      const response = await api.get('/mobile-lab/current-week');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get current week schedule error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch current week schedule',
        error: error.response?.data?.error
      };
    }
  },

  // Get currently active mobile lab location (public)
  getCurrentActiveLocation: async () => {
    try {
      const response = await api.get('/mobile-lab/current-active');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get current active location error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch current active location',
        error: error.response?.data?.error
      };
    }
  },

  // Get next scheduled mobile lab location (public)
  getNextLocation: async () => {
    try {
      const response = await api.get('/mobile-lab/next-location');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get next location error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch next location',
        error: error.response?.data?.error
      };
    }
  },

  // Get mobile lab statistics (admin only)
  getMobileLabStats: async () => {
    try {
      const response = await api.get('/mobile-lab/stats');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get mobile lab stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch mobile lab statistics',
        error: error.response?.data?.error
      };
    }
  },

  // Get single mobile lab schedule by ID
  getMobileLabSchedule: async (scheduleId) => {
    try {
      const response = await api.get(`/mobile-lab/${scheduleId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Get mobile lab schedule error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch mobile lab schedule',
        error: error.response?.data?.error
      };
    }
  },

  // Create new mobile lab schedule (admin only)
  createMobileLabSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/mobile-lab', scheduleData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Create mobile lab schedule error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create mobile lab schedule',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Update mobile lab schedule (admin only)
  updateMobileLabSchedule: async (scheduleId, updateData) => {
    try {
      const response = await api.put(`/mobile-lab/${scheduleId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update mobile lab schedule error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update mobile lab schedule',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Delete mobile lab schedule (admin only) - soft delete
  deleteMobileLabSchedule: async (scheduleId) => {
    try {
      const response = await api.delete(`/mobile-lab/${scheduleId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Delete mobile lab schedule error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete mobile lab schedule',
        error: error.response?.data?.error
      };
    }
  },

  // Update mobile lab schedule status (admin/staff only)
  updateScheduleStatus: async (scheduleId, status) => {
    try {
      const response = await api.put(`/mobile-lab/${scheduleId}/status`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update schedule status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update schedule status',
        error: error.response?.data?.error
      };
    }
  },

  // Update booking count for mobile lab schedule
  updateBookingCount: async (scheduleId, increment = 1) => {
    try {
      const response = await api.put(`/mobile-lab/${scheduleId}/booking-count`, { increment });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update booking count error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update booking count',
        error: error.response?.data?.error
      };
    }
  }
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
