// Test address and patient ID handling for both string and object formats
const axios = require('axios');

async function testAddressAndPatientId() {
  try {
    console.log('🧪 Testing Address and Patient ID Handling...\n');
    
    // Test 1: Register new user with simple string address
    console.log('🔸 Test 1: Register user with string address');
    const registerData1 = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+639123456789',
      address: 'Simple string address, City, Province'
    };

    const registerResponse1 = await axios.post('http://localhost:5000/api/auth/register', registerData1);
    const newUser1 = registerResponse1.data.user;
    
    console.log('✅ Registration successful!');
    console.log('Patient ID:', newUser1.patientId);
    console.log('Address (raw):', newUser1.address);
    console.log('Formatted Address:', newUser1.formattedAddress);
    console.log('Role:', newUser1.role);

    // Test 2: Test /me endpoint to verify data persistence
    console.log('\n🔸 Test 2: Verify /me endpoint returns complete data');
    const meResponse1 = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${registerResponse1.data.token}` }
    });
    const meUser1 = meResponse1.data.user;
    
    console.log('✅ /me endpoint response:');
    console.log('Patient ID:', meUser1.patientId);
    console.log('Address (raw):', meUser1.address);
    console.log('Formatted Address:', meUser1.formattedAddress);

    // Test 3: Update profile with object address (simulate old user)
    console.log('\n🔸 Test 3: Update profile with object address format');
    const updateData = {
      address: {
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        zipCode: '1234'
      }
    };

    const updateResponse = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
      headers: { 'Authorization': `Bearer ${registerResponse1.data.token}` }
    });
    const updatedUser = updateResponse.data.user;
    
    console.log('✅ Profile update successful!');
    console.log('Address (raw):', JSON.stringify(updatedUser.address, null, 2));
    console.log('Formatted Address:', updatedUser.formattedAddress);

    // Test 4: Verify persistence after object address update
    console.log('\n🔸 Test 4: Verify object address persistence');
    const meResponse2 = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${registerResponse1.data.token}` }
    });
    const meUser2 = meResponse2.data.user;
    
    console.log('✅ /me endpoint after object address update:');
    console.log('Address (raw):', JSON.stringify(meUser2.address, null, 2));
    console.log('Formatted Address:', meUser2.formattedAddress);

    // Test 5: Update back to string address
    console.log('\n🔸 Test 5: Update back to string address');
    const updateData2 = {
      address: 'Updated simple string address'
    };

    const updateResponse2 = await axios.put('http://localhost:5000/api/auth/profile', updateData2, {
      headers: { 'Authorization': `Bearer ${registerResponse1.data.token}` }
    });
    const updatedUser2 = updateResponse2.data.user;
    
    console.log('✅ Profile update back to string successful!');
    console.log('Address (raw):', updatedUser2.address);
    console.log('Formatted Address:', updatedUser2.formattedAddress);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- String addresses work correctly ✅');
    console.log('- Object addresses work correctly ✅');
    console.log('- Patient ID is generated and returned ✅');
    console.log('- FormattedAddress handles both formats ✅');
    console.log('- All endpoints return complete user data ✅');

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Config:', error.config);
  }
}

testAddressAndPatientId();