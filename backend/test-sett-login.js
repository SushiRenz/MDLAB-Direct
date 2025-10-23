const axios = require('axios');

async function testSettLogin() {
  try {
    console.log('🔐 Testing Sett login and test result access...\n');
    
    // 1. Login as Sett
    console.log('1️⃣ Logging in as sett@gmail.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'sett@gmail.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   User ID: ${loginResponse.data.user.id}`);
      
      const token = loginResponse.data.token;
      
      // 2. Get patient's test results
      console.log('\n2️⃣ Fetching Sett\'s test results...');
      const resultsResponse = await axios.get('http://localhost:5000/api/test-results/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (resultsResponse.data.success) {
        console.log(`✅ Test results retrieved successfully!`);
        console.log(`   Found: ${resultsResponse.data.count} results`);
        
        if (resultsResponse.data.count > 0) {
          console.log('\n📋 Sett\'s Test Results:');
          resultsResponse.data.data.forEach((result, index) => {
            console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
            console.log(`      Test Type: ${result.testType}`);
            console.log(`      Status: ${result.status}`);
            console.log(`      Sample Date: ${result.sampleDate}`);
            console.log(`      Released Date: ${result.releasedDate || 'Not released'}`);
            console.log(`      Patient ID in result: ${result.patient}`);
            console.log('      ---');
          });
          
          console.log('\n🎉 SUCCESS! Sett can now see his test results in the patient portal!');
        } else {
          console.log('\n❌ No test results found for Sett');
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

testSettLogin();