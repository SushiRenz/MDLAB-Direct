// Debug logger for frontend authentication issues
class AuthDebugger {
  constructor() {
    this.logs = [];
    this.maxLogs = 50;
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      url: window.location.href,
      userAgent: navigator.userAgent.substr(0, 50)
    };
    
    console.log(`🔍 AuthDebug [${timestamp}]: ${message}`, data);
    
    // Store in localStorage for persistence
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    localStorage.setItem('auth_debug_logs', JSON.stringify(this.logs));
    
    // Also try to send to backend for persistence
    this.sendToBackend(logEntry);
  }

  async sendToBackend(logEntry) {
    // Temporarily disabled to avoid 404 errors
    // try {
    //   await fetch('http://192.168.1.112:5000/api/debug/frontend-log', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(logEntry)
    //   });
    // } catch (error) {
    //   // Ignore backend logging errors
    // }
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('auth_debug_logs');
  }

  exportLogs() {
    const logs = this.getLogs();
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.message}\n${log.data ? `Data: ${log.data}\n` : ''}URL: ${log.url}\n---\n`
    ).join('\n');
    
    console.log('=== AUTH DEBUG LOGS ===\n' + logText);
    return logText;
  }
}

// Create global instance
window.authDebugger = new AuthDebugger();

// Add global debug function for easy console access
window.showAuthLogs = () => {
  console.log('=== AUTH DEBUG LOGS ===');
  const logs = window.authDebugger.getLogs();
  logs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.timestamp}] ${log.message}`);
    if (log.data) {
      console.log('   Data:', JSON.parse(log.data));
    }
  });
  console.log('=== END LOGS ===');
};

// Add global session check function
window.checkSession = () => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');
  console.log('=== SESSION CHECK ===');
  console.log('Token:', token ? token.substr(0, 20) + '...' : 'NOT SET');
  console.log('User:', user ? JSON.parse(user) : 'NOT SET');
  console.log('Current URL:', window.location.href);
  console.log('=== END SESSION ===');
};

console.log('🔍 Auth Debugger loaded. Use showAuthLogs() or checkSession() in console for debugging.');

// Log initial state
window.authDebugger.log('AuthDebugger initialized', {
  hasToken: !!sessionStorage.getItem('token'),
  hasUser: !!sessionStorage.getItem('user'),
  currentUrl: window.location.href
});

export default window.authDebugger;