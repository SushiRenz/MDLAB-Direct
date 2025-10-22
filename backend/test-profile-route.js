const axios = require('axios');

async function testProfileRoute() {
  try {
    console.log('Testing profile route...');
    
    // First login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://192.168.1.112:5000/api/auth/login', {
      email: 'patient@test.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test the /api/auth/me endpoint
    console.log('Step 2: Testing /api/auth/me...');
    const meResponse = await axios.get('http://192.168.1.112:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ /api/auth/me response:', meResponse.data);
    
    // Test the /api/users/me GET endpoint
    console.log('Step 3: Testing GET /api/users/me...');
    try {
      const usersMeResponse = await axios.get('http://192.168.1.112:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ GET /api/users/me response:', usersMeResponse.data);
    } catch (error) {
      console.log('❌ GET /api/users/me failed (this might be expected):', error.response?.status, error.response?.data);
    }
    
    // Test the /api/users/me PUT endpoint (profile update)
    console.log('Step 4: Testing PUT /api/users/me...');
    const updateResponse = await axios.put('http://192.168.1.112:5000/api/users/me', {
      gender: 'Male',
      address: 'Test Address'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT /api/users/me response:', updateResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
  }
}

testProfileRoute();