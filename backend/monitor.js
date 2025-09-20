const http = require('http');

// Simple server monitoring and keep-alive script
class ServerMonitor {
  constructor(serverUrl = 'http://localhost:5000', interval = 30000) {
    this.serverUrl = serverUrl;
    this.interval = interval;
    this.isRunning = false;
    this.consecutiveFailures = 0;
    this.maxFailures = 3;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitor already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting server monitor...');
    console.log(`📍 Monitoring: ${this.serverUrl}`);
    console.log(`⏰ Check interval: ${this.interval / 1000} seconds`);
    
    this.checkHealth();
    this.timer = setInterval(() => {
      this.checkHealth();
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('🛑 Server monitor stopped');
  }

  checkHealth() {
    const startTime = Date.now();
    
    const req = http.get(`${this.serverUrl}/api/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const healthData = JSON.parse(data);
          
          if (res.statusCode === 200 && healthData.success) {
            this.consecutiveFailures = 0;
            console.log(`✅ Server healthy | Response time: ${responseTime}ms | Uptime: ${Math.floor(healthData.uptime)}s | MongoDB: ${healthData.mongodb?.statusText || 'unknown'}`);
          } else {
            this.handleFailure(`Unhealthy response: ${res.statusCode}`);
          }
        } catch (error) {
          this.handleFailure(`Parse error: ${error.message}`);
        }
      });
    });

    req.on('error', (error) => {
      this.handleFailure(`Connection error: ${error.message}`);
    });

    req.setTimeout(10000, () => {
      req.abort();
      this.handleFailure('Request timeout');
    });
  }

  handleFailure(reason) {
    this.consecutiveFailures++;
    const timestamp = new Date().toISOString();
    
    console.error(`❌ [${timestamp}] Health check failed: ${reason} (${this.consecutiveFailures}/${this.maxFailures})`);
    
    if (this.consecutiveFailures >= this.maxFailures) {
      console.error('🚨 Server appears to be down! Multiple consecutive failures detected.');
      console.error('💡 Consider restarting the server or checking the logs.');
    }
  }

  // Send periodic ping to keep connection alive
  ping() {
    const req = http.get(`${this.serverUrl}/api/ping`, (res) => {
      if (res.statusCode === 200) {
        console.log('🏓 Ping successful - connection kept alive');
      }
    });

    req.on('error', (error) => {
      console.error('🏓 Ping failed:', error.message);
    });

    req.setTimeout(5000, () => {
      req.abort();
    });
  }
}

// Auto-start monitor if this file is run directly
if (require.main === module) {
  const monitor = new ServerMonitor();
  
  // Start monitoring
  monitor.start();
  
  // Send periodic pings to keep connection alive
  setInterval(() => {
    monitor.ping();
  }, 60000); // Ping every minute
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
  });
}

module.exports = ServerMonitor;