import axios from 'axios';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

/**
 * Network Diagnostics Utility
 * Helps debug connection issues between mobile app and backend
 */
const NetworkDiagnostics = {
  /**
   * Check if device has internet connectivity
   */
  checkInternetConnection: async (): Promise<DiagnosticResult> => {
    try {
      // Simple internet check by pinging a public API
      await axios.get('https://www.google.com', { timeout: 3000 });
      
      return {
        success: true,
        message: '✅ Device has internet connection',
        details: {
          isConnected: true,
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: '❌ No internet connection detected',
        error: error.message
      };
    }
  },

  /**
   * Get device's IP address
   * Note: React Native doesn't have built-in IP detection, this is a placeholder
   */
  getDeviceIP: async (): Promise<DiagnosticResult> => {
    try {
      // For React Native, we can't easily get the device IP without additional packages
      // This is mainly informational
      return {
        success: true,
        message: '📱 Device IP detection not available in React Native',
        details: { 
          note: 'Use your phone\'s WiFi settings to check your IP address'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: '❌ Could not get device IP',
        error: error.message
      };
    }
  },

  /**
   * Test connection to backend server
   */
  testBackendConnection: async (backendUrl: string): Promise<DiagnosticResult> => {
    try {
      console.log(`🔍 Testing connection to: ${backendUrl}`);
      
      const startTime = Date.now();
      const response = await axios.get(`${backendUrl}/health`, {
        timeout: 5000,
        validateStatus: () => true, // Accept any status
      });
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        return {
          success: true,
          message: `✅ Backend is reachable (${responseTime}ms)`,
          details: {
            status: response.status,
            responseTime: `${responseTime}ms`,
            data: response.data
          }
        };
      } else {
        return {
          success: false,
          message: `⚠️ Backend responded with status ${response.status}`,
          details: {
            status: response.status,
            responseTime: `${responseTime}ms`,
            data: response.data
          }
        };
      }
    } catch (error: any) {
      console.error('Backend connection test failed:', error);
      
      let errorMessage = '❌ Cannot reach backend server';
      let errorDetails = '';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = '❌ Connection refused - Server not running?';
        errorDetails = 'The backend server might not be running on the specified IP and port.';
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        errorMessage = '❌ Connection timeout';
        errorDetails = 'The server is taking too long to respond. Check if the IP address is correct.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = '❌ Network error';
        errorDetails = 'Cannot connect to server. Make sure your device and computer are on the same WiFi network.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorDetails || error.message,
        details: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  /**
   * Test authentication endpoint
   */
  testAuthEndpoint: async (backendUrl: string): Promise<DiagnosticResult> => {
    try {
      const response = await axios.post(`${backendUrl}/auth/login`, {
        identifier: 'test@test.com',
        password: 'test123'
      }, {
        timeout: 5000,
        validateStatus: () => true,
      });
      
      // We expect a 401 (unauthorized) which means the endpoint is working
      if (response.status === 401 || response.status === 400) {
        return {
          success: true,
          message: '✅ Auth endpoint is responding',
          details: {
            status: response.status,
            message: 'Endpoint is working (rejected test credentials as expected)'
          }
        };
      } else if (response.status === 200) {
        return {
          success: true,
          message: '⚠️ Auth endpoint accepted test credentials (unexpected)',
          details: {
            status: response.status,
            data: response.data
          }
        };
      } else {
        return {
          success: false,
          message: `⚠️ Auth endpoint returned unexpected status: ${response.status}`,
          details: response.data
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: '❌ Cannot reach auth endpoint',
        error: error.message,
        details: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  /**
   * Run all diagnostics
   */
  runFullDiagnostics: async (backendUrl: string): Promise<{
    internet: DiagnosticResult;
    deviceIP: DiagnosticResult;
    backend: DiagnosticResult;
    auth: DiagnosticResult;
    summary: {
      allPassed: boolean;
      passedCount: number;
      totalCount: number;
    };
  }> => {
    console.log('🔬 Running full network diagnostics...');
    
    const internet = await NetworkDiagnostics.checkInternetConnection();
    const deviceIP = await NetworkDiagnostics.getDeviceIP();
    const backend = await NetworkDiagnostics.testBackendConnection(backendUrl);
    const auth = await NetworkDiagnostics.testAuthEndpoint(backendUrl);
    
    const results = [internet, deviceIP, backend, auth];
    const passedCount = results.filter(r => r.success).length;
    const allPassed = passedCount === results.length;
    
    console.log(`📊 Diagnostics complete: ${passedCount}/${results.length} passed`);
    
    return {
      internet,
      deviceIP,
      backend,
      auth,
      summary: {
        allPassed,
        passedCount,
        totalCount: results.length
      }
    };
  }
};

export { NetworkDiagnostics };

/**
 * Get troubleshooting suggestions based on diagnostic results
 */
export const getTroubleshootingSuggestions = (diagnostics: Awaited<ReturnType<typeof NetworkDiagnostics.runFullDiagnostics>>): string[] => {
    const suggestions: string[] = [];
    
    if (!diagnostics.internet.success) {
      suggestions.push('📱 Enable WiFi or mobile data on your device');
      suggestions.push('✈️ Make sure Airplane mode is OFF');
    }
    
    if (!diagnostics.backend.success) {
      suggestions.push('💻 Make sure the backend server is running on your computer');
      suggestions.push('🌐 Verify your device and computer are on the SAME WiFi network');
      suggestions.push('🔢 Check if the IP address in api.ts matches your computer\'s IP');
      suggestions.push('🔥 Disable any firewalls that might block port 5000');
      suggestions.push('📋 To find your computer\'s IP: Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux)');
    }
    
    if (diagnostics.backend.success && !diagnostics.auth.success) {
      suggestions.push('🔧 Backend server is reachable but auth endpoint has issues');
      suggestions.push('📝 Check backend logs for errors');
      suggestions.push('🔄 Try restarting the backend server');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('✅ All diagnostics passed! The app should work correctly.');
    }
    
    return suggestions;
  };

/**
 * Helper to get computer's local IP address instructions
 */
export const getIPAddressInstructions = (): string => {
  return `
📋 How to find your computer's IP address:

Windows:
1. Open Command Prompt (cmd)
2. Type: ipconfig
3. Look for "IPv4 Address" under your WiFi adapter
4. It usually looks like: 192.168.x.x

Mac/Linux:
1. Open Terminal
2. Type: ifconfig
3. Look for "inet" under en0 or wlan0
4. It usually looks like: 192.168.x.x

⚠️ Important:
- Your device and computer MUST be on the same WiFi network
- The IP address may change if you restart your router
- Update the IP in mobile/services/api.ts if it changes
  `;
};
