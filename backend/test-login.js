const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    console.log('Sending request to: http://192.168.1.112:5000/api/auth/login');
    console.log('With credentials:', { identifier: 'marlo@gmail.com', password: 'password123' });
    
    // Test with a simple login request
    const response = await axios.post('http://192.168.1.112:5000/api/auth/login', {
      identifier: 'marlo@gmail.com',
      password: 'password123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login response:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user
    });
    
  } catch (error) {
    console.error('❌ Login failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      errors: error.response?.data?.errors,
      code: error.code
    });
  }
}

testLogin();