const axios = require('axios');

async function testPennyLogin() {
  try {
    console.log('🔐 Testing Pen Penny login (known working account)...\n');
    
    // 1. Login as Pen Penny (we know this works)
    console.log('1️⃣ Logging in as penny@gmail.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'penny@gmail.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   User ID: ${loginResponse.data.user.id}`);
      
      const token = loginResponse.data.token;
      
      // 2. Get patient's test results
      console.log('\n2️⃣ Fetching Pen Penny\'s test results...');
      const resultsResponse = await axios.get('http://localhost:5000/api/test-results/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (resultsResponse.data.success) {
        console.log(`✅ Test results retrieved successfully!`);
        console.log(`   Found: ${resultsResponse.data.count} results`);
        
        if (resultsResponse.data.count > 0) {
          console.log('\n📋 Pen Penny\'s Test Results:');
          resultsResponse.data.data.forEach((result, index) => {
            console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
            console.log(`      Test Type: ${result.testType}`);
            console.log(`      Status: ${result.status}`);
            console.log(`      Sample Date: ${result.sampleDate}`);
            console.log(`      Released Date: ${result.releasedDate || 'Not released'}`);
            console.log(`      Patient ID in result: ${result.patient}`);
            console.log('      ---');
          });
          
          console.log('\n🎉 SUCCESS! Pen Penny can see her test results!');
        } else {
          console.log('\n❌ No test results found for Pen Penny');
        }
      } else {
        console.log('❌ Failed to get test results:', resultsResponse.data.message);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testPennyLogin();