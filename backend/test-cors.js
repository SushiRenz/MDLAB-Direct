// Simple CORS test
const https = require('http');

const options = {
  hostname: '192.168.1.112',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Origin': 'http://192.168.1.112:5173',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    // Check CORS headers
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is working! Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    } else {
      console.log('❌ CORS not working - Missing Access-Control-Allow-Origin header');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();