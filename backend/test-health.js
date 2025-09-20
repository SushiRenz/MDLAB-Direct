const fetch = require('node-fetch');

async function testHealth() {
  try {
    console.log('🔍 Testing enhanced health endpoint...\n');
    
    const response = await fetch('http://localhost:5000/api/health');
    const healthData = await response.json();
    
    console.log('✅ Server Health Report:');
    console.log('========================');
    console.log(`Status: ${healthData.success ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`Uptime: ${Math.floor(healthData.uptime)} seconds`);
    console.log(`Environment: ${healthData.environment}`);
    console.log(`MongoDB Status: ${healthData.mongodb.statusText} (${healthData.mongodb.status})`);
    console.log(`Memory Usage: ${Math.round(healthData.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(healthData.memory.heapTotal / 1024 / 1024)}MB`);
    console.log(`Process ID: ${healthData.pid}`);
    console.log(`Timestamp: ${healthData.timestamp}`);
    
    // Test ping endpoint
    console.log('\n🏓 Testing ping endpoint...');
    const pingResponse = await fetch('http://localhost:5000/api/ping');
    const pingData = await pingResponse.json();
    console.log(`Ping: ${pingData.message} at ${pingData.timestamp}`);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.error('💡 Make sure the server is running with: npm start');
  }
}

testHealth();