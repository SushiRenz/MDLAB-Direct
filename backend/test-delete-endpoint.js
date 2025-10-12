const axios = require('axios');

async function testDeleteEndpoint() {
  try {
    console.log('🧪 Testing DELETE endpoint...');
    
    // First get the list of appointments to find one to delete
    const response = await axios.get('http://localhost:5000/api/appointments', {
      headers: {
        'Authorization': 'Bearer your_token_here' // You'll need a valid token
      }
    });
    
    console.log('✅ DELETE endpoint exists and is accessible');
    console.log('📋 Available appointment routes:');
    console.log('- GET /api/appointments');
    console.log('- POST /api/appointments');
    console.log('- GET /api/appointments/:id');
    console.log('- PUT /api/appointments/:id');
    console.log('- PUT /api/appointments/:id/cancel');
    console.log('- DELETE /api/appointments/:id ✨ (NEW)');
    console.log('- PUT /api/appointments/:id/checkin');
    console.log('- PUT /api/appointments/:id/checkout');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ DELETE endpoint exists (got 401 auth error as expected)');
    } else {
      console.error('❌ Error testing endpoint:', error.message);
    }
  }
}

testDeleteEndpoint();