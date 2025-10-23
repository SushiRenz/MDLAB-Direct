const axios = require('axios');

async function testSignupAndLogin() {
  try {
    console.log('🧪 Testing complete signup and login flow...\n');
    
    // Create a new test account
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@gmail.com`,
      password: 'Password123!',  // Meets requirements: uppercase, lowercase, number
      firstName: 'Test',
      lastName: 'User',
      phone: '+639123456789',     // Valid Philippine phone format
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: 'Test Address'
    };
    
    console.log('1️⃣ Creating new account...');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}`);
    
    const signupResponse = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    if (signupResponse.data.success) {
      console.log('✅ Signup successful!');
      console.log(`   User ID: ${signupResponse.data.user.id}`);
      console.log(`   Token received: ${!!signupResponse.data.token}`);
      
      // Try to login immediately with the same credentials
      console.log('\n2️⃣ Testing immediate login...');
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: testUser.email,
        password: testUser.password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
        console.log(`   User ID: ${loginResponse.data.user.id}`);
        console.log(`   Token: ${loginResponse.data.token?.substring(0, 20)}...`);
        
        // Test token validation
        console.log('\n3️⃣ Testing token validation...');
        const validateResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        if (validateResponse.data.success) {
          console.log('✅ Token validation successful!');
          console.log(`   Validated user: ${validateResponse.data.user.firstName} ${validateResponse.data.user.lastName}`);
        } else {
          console.log('❌ Token validation failed:', validateResponse.data.message);
        }
        
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
      
    } else {
      console.log('❌ Signup failed:', signupResponse.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testSignupAndLogin();