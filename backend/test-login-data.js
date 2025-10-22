// Test existing user login to verify address and patient ID are returned
const axios = require('axios');

async function testExistingUser() {
  try {
    console.log('🧪 Testing Existing User Data Return...\n');
    
    // Test with an existing user
    console.log('🔸 Login with existing user: renz09358@gmail.com');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'renz09358@gmail.com',
      password: 'Renz1234'
    });

    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Full Name:', user.fullName);
    console.log('Patient ID:', user.patientId || 'NOT FOUND ❌');
    console.log('Address (raw):', user.address || 'NOT FOUND ❌');
    console.log('Formatted Address:', user.formattedAddress || 'NOT FOUND ❌');

    // Test /me endpoint
    console.log('\n🔸 Testing /me endpoint');
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
    });
    
    const meUser = meResponse.data.user;
    console.log('✅ /me endpoint successful!');
    console.log('Patient ID:', meUser.patientId || 'NOT FOUND ❌');
    console.log('Address (raw):', meUser.address || 'NOT FOUND ❌');
    console.log('Formatted Address:', meUser.formattedAddress || 'NOT FOUND ❌');

    console.log('\n📋 Summary:');
    console.log('- Login returns patient ID:', user.patientId ? '✅' : '❌');
    console.log('- Login returns address:', user.address ? '✅' : '❌');
    console.log('- Login returns formatted address:', user.formattedAddress ? '✅' : '❌');
    console.log('- /me returns patient ID:', meUser.patientId ? '✅' : '❌');
    console.log('- /me returns address:', meUser.address ? '✅' : '❌');
    console.log('- /me returns formatted address:', meUser.formattedAddress ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error('Error:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

testExistingUser();