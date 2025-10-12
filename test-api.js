const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing appointments API...');
    
    // Test 1: Get all appointments
    console.log('\n1. Getting all appointments...');
    const allResponse = await axios.get('http://localhost:5000/api/appointments');
    console.log('All appointments response:', allResponse.data);
    
    // Test 2: Get checked-in appointments (lowercase)
    console.log('\n2. Getting checked-in appointments (lowercase)...');
    const checkedInResponse = await axios.get('http://localhost:5000/api/appointments?status=checked-in');
    console.log('Checked-in appointments response:', checkedInResponse.data);
    
    // Test 3: Get CHECKED-IN appointments (uppercase)
    console.log('\n3. Getting CHECKED-IN appointments (uppercase)...');
    const checkedInUpperResponse = await axios.get('http://localhost:5000/api/appointments?status=CHECKED-IN');
    console.log('CHECKED-IN appointments response:', checkedInUpperResponse.data);
    
  } catch (error) {
    console.error('API test error:', error.response?.data || error.message);
  }
}

testAPI();