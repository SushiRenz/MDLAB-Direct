// Test OPTIONS preflight request
const http = require('http');

const options = {
  hostname: '192.168.1.112',
  port: 5000,
  path: '/api/appointments',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://192.168.1.112:5173',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type'
  }
};

const req = http.request(options, (res) => {
  console.log(`OPTIONS Status: ${res.statusCode}`);
  console.log('CORS Headers:');
  
  const corsHeaders = {};
  Object.keys(res.headers).forEach(header => {
    if (header.includes('access-control')) {
      corsHeaders[header] = res.headers[header];
    }
  });
  
  console.log(corsHeaders);
  
  if (res.statusCode === 200 && corsHeaders['access-control-allow-origin']) {
    console.log('✅ OPTIONS preflight is working correctly');
  } else {
    console.log('❌ OPTIONS preflight has issues');
  }
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();