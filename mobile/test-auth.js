console.log('🔐 Testing mobile app authentication...');

const API_BASE_URL = 'http://192.168.1.112:5000/api';

// Test login with patient credentials
async function testPatientLogin() {
  try {
    console.log('📱 Testing patient login...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'patient@test.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('📡 Login response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.token) {
      console.log('✅ Login successful, testing appointments...');
      await testAppointments(data.token);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('🚨 Login error:', error.message);
  }
}

// Test appointments endpoint with token
async function testAppointments(token) {
  try {
    console.log('📋 Testing appointments endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('📡 Appointments response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Appointments fetch successful:', data.data?.length || 0, 'appointments');
    } else {
      console.log('❌ Appointments fetch failed:', data.message);
    }
    
  } catch (error) {
    console.error('🚨 Appointments error:', error.message);
  }
}

// Run the test
testPatientLogin().then(() => {
  console.log('🏁 Authentication test completed');
}).catch(error => {
  console.error('🚨 Test failed:', error.message);
});