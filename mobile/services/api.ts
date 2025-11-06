import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const getApiBaseUrl = () => {
  const BACKEND_PORT = '5000';
  const BACKEND_IP = '192.168.1.112'; // Your computer's IP address
  
  return `http://${BACKEND_IP}:${BACKEND_PORT}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added to request for:', config.url);
      } else {
        console.log('❌ No token found for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Authentication failed for:', error.config?.url);
      // Token expired or invalid - clear stored credentials
      try {
        await AsyncStorage.multiRemove(['token', 'user']);
        console.log('🧹 Cleared invalid credentials');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Response type interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  patientId?: string;
  phone?: string;
  address?: string | object;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  profilePic?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  _id: string;
  appointmentId: string;
  patient: string;
  patientName: string;
  contactNumber: string;
  email: string;
  address: string;
  age?: number;
  sex?: string;
  service?: string;
  services?: string[];
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  priority: string;
  notes?: string;
  totalPrice?: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  _id: string;
  serviceName: string;
  description?: string;
  category?: string;
  price: number;
  isActive: boolean;
  isPopular?: boolean;
  duration?: number;
  requirements?: string;
  preparationInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  _id: string;
  sampleId: string;
  appointment?: string;
  patient: string;
  patientName: string;
  service: string;
  serviceName: string;
  testType: string;
  sampleDate: string;
  results: Record<string, any>;
  status: string;
  isNew: boolean;
  isAbnormal?: boolean;
  isCritical?: boolean;
  medTech?: {
    firstName: string;
    lastName: string;
  };
  pathologist?: {
    firstName: string;
    lastName: string;
  };
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface MobileLabSchedule {
  _id: string;
  dayOfWeek: number;
  location: {
    name: string;
    barangay: string;
    municipality?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  status: string;
  maxCapacity?: number;
  currentBookings?: number;
  isActive: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
    contactPerson?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string; // Updated to match backend expectation
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/register', userData);
      
      // Store token and user data
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          user: response.data.user,
          token: response.data.token
        }
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Login user
  login: async (credentials: {
    identifier: string; // email or username
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', credentials);
      
      // Store token and user data
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          user: response.data.user,
          token: response.data.token
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Network error - please check your connection';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not running';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login endpoint not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error - please try again later';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'Invalid username or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data?.error
      };
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear stored data
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return { success: true, message: 'Logged out successfully' };
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await api.get('/auth/me');
      return {
        success: response.data.success,
        data: { user: response.data.user }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user data',
        error: error.response?.data?.error
      };
    }
  },

  // Update profile
  updateProfile: async (profileData: {
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      if (response.data.success && response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: response.data.success,
        data: { user: response.data.user }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
        error: error.response?.data?.error
      };
    }
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
        error: error.response?.data?.error
      };
    }
  },
};

// Services API functions
export const servicesAPI = {
  // Get all services with filtering and pagination
  getServices: async (params: {
    limit?: number;
    page?: number;
    category?: string;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<ApiResponse<Service[]>> => {
    try {
      console.log('🔍 Making services API call with params:', params);
      
      // Fetch all pages to get complete data like the web frontend
      const allServices: Service[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const pageParams = { ...params, page: currentPage, limit: 50 };
        console.log(`📄 Fetching page ${currentPage}...`);
        
        const response: AxiosResponse<{ 
          success: boolean; 
          data: Service[]; 
          message?: string;
          pagination?: {
            currentPage: number;
            totalPages: number;
            hasNext: boolean;
          };
        }> = await api.get('/services', { params: pageParams });
        
        console.log(`📡 Services API response page ${currentPage}:`, response.data);
        
        if (response.data.success && response.data.data) {
          allServices.push(...response.data.data);
          
          // Check if there are more pages
          const pagination = response.data.pagination;
          hasMore = pagination?.hasNext || false;
          currentPage++;
          
          console.log(`📊 Page ${currentPage - 1}: Got ${response.data.data.length} services. Total so far: ${allServices.length}. Has more: ${hasMore}`);
        } else {
          hasMore = false;
        }
      }
      
      console.log(`✅ Fetched all services. Total: ${allServices.length}`);
      
      return {
        success: true,
        data: allServices,
        message: `Successfully fetched ${allServices.length} services`
      };
    } catch (error: any) {
      console.error('❌ Get services error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch services',
        error: error.response?.data?.error
      };
    }
  },

  // Get popular services
  getPopularServices: async (limit: number = 10): Promise<ApiResponse<Service[]>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: Service[] }> = await api.get('/services/popular', { params: { limit } });
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch popular services',
        error: error.response?.data?.error
      };
    }
  },

  // Get service by ID
  getServiceById: async (serviceId: string): Promise<ApiResponse<Service>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: Service }> = await api.get(`/services/${serviceId}`);
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service',
        error: error.response?.data?.error
      };
    }
  },
};

// Appointment API functions
export const appointmentAPI = {
  // Get appointments with filtering
  // NOTE: For patients, the backend automatically filters by authenticated user's ID
  // DO NOT pass patientId parameter - it's handled by authentication middleware (same as web)
  getAppointments: async (params: {
    status?: string;
    date?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<ApiResponse<{ data: Appointment[]; pagination?: any }>> => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/appointments${queryString ? `?${queryString}` : ''}`;
      
      console.log('🌐 GET APPOINTMENTS REQUEST');
      console.log('   URL:', `${API_BASE_URL}${url}`);
      console.log('   Query params:', queryString || 'none');
      
      const response: AxiosResponse<{ success: boolean; data: Appointment[]; pagination?: any; message?: string }> = await api.get(url);
      
      console.log('📡 GET APPOINTMENTS RESPONSE');
      console.log('   Success:', response.data.success);
      console.log('   Appointments count:', response.data.data?.length || 0);
      console.log('   Raw response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('📋 Sample appointment:', JSON.stringify(response.data.data[0], null, 2));
      } else {
        console.log('⚠️ NO APPOINTMENTS - Backend returned empty array');
      }
      
      return {
        success: true,
        data: {
          data: response.data.data || [],
          pagination: response.data.pagination
        },
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ GET APPOINTMENTS ERROR');
      console.error('   Error message:', error.message);
      console.error('   Response data:', error.response?.data);
      console.error('   Status code:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        error: error.response?.data?.error
      };
    }
  },

  // Create new appointment
  // NOTE: The backend controller automatically sets the 'patient' field from req.user._id
  // patientId in request body is optional and can be overridden by backend
  createAppointment: async (appointmentData: {
    patientId?: string;
    patientName: string;
    contactNumber: string;
    email: string;
    address?: string;
    age?: number;
    sex?: string;
    serviceIds: string[];
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    type?: string;
    priority?: string;
    totalPrice?: number;
    notes?: string;
    reasonForVisit?: string;
  }): Promise<ApiResponse<Appointment>> => {
    try {
      // Get current user to set createdBy fields
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      const payload = {
        ...appointmentData,
        createdBy: user?._id || user?.id,
        createdByName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Patient'
      };
      
      console.log('🌐 CREATE APPOINTMENT REQUEST');
      console.log('   URL:', `${API_BASE_URL}/appointments`);
      console.log('   Payload:', JSON.stringify(payload, null, 2));
      console.log('   ServiceIds:', payload.serviceIds);
      console.log('   Patient name:', payload.patientName);
      console.log('   Date:', payload.appointmentDate);
      
      const response: AxiosResponse<{ success: boolean; data: Appointment; message?: string }> = await api.post('/appointments', payload);
      
      console.log('📡 CREATE APPOINTMENT RESPONSE');
      console.log('   Success:', response.data.success);
      console.log('   Created appointment ID:', response.data.data?._id);
      console.log('   Response data:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ CREATE APPOINTMENT ERROR');
      console.error('   Error message:', error.message);
      console.error('   Response status:', error.response?.status);
      console.error('   Response data:', error.response?.data);
      console.error('   Validation errors:', error.response?.data?.errors);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        error: error.response?.data?.error,
        errors: error.response?.data?.errors
      };
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, updateData: {
    appointmentDate?: string;
    appointmentTime?: string;
    status?: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: Appointment; message?: string }> = await api.put(`/appointments/${appointmentId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        error: error.response?.data?.error
      };
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string, reason: string = ''): Promise<ApiResponse<Appointment>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: Appointment; message?: string }> = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel appointment',
        error: error.response?.data?.error
      };
    }
  },
};

// Test Results API functions
export const testResultsAPI = {
  // Get patient's own released test results
  getMyTestResults: async (): Promise<ApiResponse<{ data: TestResult[]; count: number }>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: TestResult[]; count: number; message?: string }> = await api.get('/test-results/my');
      return {
        success: true,
        data: {
          data: response.data.data,
          count: response.data.count
        },
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get my test results error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your test results',
        error: error.response?.data?.error
      };
    }
  },

  // Mark test result as viewed
  markAsViewed: async (testResultId: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<{ success: boolean; message?: string }> = await api.put(`/test-results/${testResultId}/mark-viewed`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Mark as viewed error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark test result as viewed',
        error: error.response?.data?.error
      };
    }
  },
};

// Mobile Lab API functions
export const mobileLabAPI = {
  // Get current week's mobile lab schedule
  getCurrentWeekSchedule: async (): Promise<ApiResponse<MobileLabSchedule[]>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: MobileLabSchedule[]; message?: string }> = await api.get('/mobile-lab/current-week');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get current week schedule error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch current week schedule',
        error: error.response?.data?.error
      };
    }
  },

  // Get currently active mobile lab location
  getCurrentActiveLocation: async (): Promise<ApiResponse<MobileLabSchedule | null>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: MobileLabSchedule | null; message?: string }> = await api.get('/mobile-lab/current-active');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get current active location error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch current active location',
        error: error.response?.data?.error
      };
    }
  },

  // Get next scheduled mobile lab location
  getNextLocation: async (): Promise<ApiResponse<MobileLabSchedule | null>> => {
    try {
      const response: AxiosResponse<{ success: boolean; data: MobileLabSchedule | null; message?: string }> = await api.get('/mobile-lab/next-location');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get next location error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch next location',
        error: error.response?.data?.error
      };
    }
  },
};

// Utility functions for authentication
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Get stored user data
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  // Get stored token
  getStoredToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  },

  // Clear all stored auth data
  clearAuthData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Check if user has specific role
  hasRole: async (role: string): Promise<boolean> => {
    try {
      const user = await authUtils.getStoredUser();
      return user?.role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  // Check if user is patient
  isPatient: async (): Promise<boolean> => {
    return await authUtils.hasRole('patient');
  },
};

// Lab Tests API
export const labTestsAPI = {
  // Get all test categories
  getCategories: async (): Promise<ApiResponse> => {
    try {
      console.log('🔗 Making request to /api/lab-tests/categories');
      const response: AxiosResponse<ApiResponse> = await api.get('/lab-tests/categories');
      console.log('📡 Categories API raw response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Categories API error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  },

  // Get tests by category
  getTestsByCategory: async (categoryName: string): Promise<ApiResponse> => {
    try {
      console.log(`🔗 Making request to /api/lab-tests?category=${categoryName}`);
      const response: AxiosResponse<ApiResponse> = await api.get(`/lab-tests?category=${categoryName}`);
      console.log(`📡 Tests API raw response for ${categoryName}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Tests API error for ${categoryName}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || `Failed to fetch tests for ${categoryName}`);
    }
  },
};

export default api;

// Export types for use in components
export type {
  ApiResponse, Appointment, MobileLabSchedule, Service,
  TestResult, User
};

