import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, authUtils } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authUtils.getStoredToken();
        const user = authUtils.getStoredUser();

        if (token && user) {
          // Verify token is still valid by getting current user
          try {
            const response = await authAPI.getCurrentUser();
            if (response.success) {
              dispatch({
                type: AUTH_ACTIONS.SET_USER,
                payload: {
                  user: response.user,
                  token: token,
                },
              });
            } else {
              // Token is invalid, clear storage
              authUtils.clearAuthData();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } catch (error) {
            // Token is invalid, clear storage
            authUtils.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    console.log('AuthContext: login called with', credentials.identifier);
    
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      console.log('AuthContext: calling authAPI.login');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: received response', response);
      
      if (response.success) {
        console.log('AuthContext: login successful, setting user');
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return response;
      } else {
        console.log('AuthContext: login failed, setting error');
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: response.message || 'Login failed',
        });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return response;
      }
    } catch (error) {
      console.error('AuthContext: login error', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.register(userData);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return response;
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: response.message || 'Registration failed',
        });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return response;
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: {
            user: response.user,
            token: state.token,
          },
        });
        return response;
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: response.message || 'Profile update failed',
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    // Utility functions
    isAdmin: () => authUtils.isAdmin(),
    isStaff: () => authUtils.isStaff(),
    hasRole: (role) => authUtils.hasRole(role),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
