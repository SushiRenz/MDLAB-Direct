// Test script to verify services API
const http = require('http');

function testServicesAPI() {
  console.log('Testing services API...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/services',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Services API Response:');
        console.log('Status Code:', res.statusCode);
        console.log('Success:', response.success);
        console.log('Services count:', response.data?.services?.length || 0);
        
        if (response.data?.services) {
          response.data.services.forEach((service, index) => {
            console.log(`${index + 1}. ${service.serviceName} - ₱${service.price}`);
          });
        } else {
          console.log('Response data:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error making request:', error.message);
  });

  req.end();
}

testServicesAPI();