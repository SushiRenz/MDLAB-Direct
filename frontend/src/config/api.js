// API Configuration for Network Access
// This allows the app to work both locally and over the network

// Get the current host
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If accessing via IP address (network access), use that IP for API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  USERS: `${API_BASE_URL}/api/users`
};

console.log('🌐 API Configuration:', {
  hostname: window.location.hostname,
  apiBaseUrl: API_BASE_URL
});
