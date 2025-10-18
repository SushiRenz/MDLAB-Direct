const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Testing the fixed API endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/test-results/appointment/APT-20251017-016', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response received!');
    console.log('Status:', response.status);
    console.log('Response structure:', Object.keys(response.data));
    
    if (response.data.testResults) {
      console.log('\n📊 Test Results Found:');
      console.log('- Status:', response.data.testResults.status);
      console.log('- Sample ID:', response.data.testResults.sampleId);
      
      if (response.data.testResults.results) {
        console.log('- Available results:', Array.from(response.data.testResults.results.keys()));
        console.log('- Hemoglobin:', response.data.testResults.results.get('hemoglobin'));
        console.log('- Blood Type:', response.data.testResults.results.get('bloodType'));
        console.log('- RBC:', response.data.testResults.results.get('rbc'));
      }
    }
    
    if (response.data.services) {
      console.log('\n🏷️ Services Found:');
      response.data.services.forEach(service => {
        console.log(`- ${service.serviceName} (${service.category})`);
      });
    }
    
    console.log('\n🎉 API is now working correctly!');
    
  } catch (error) {
    console.error('❌ API Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
  }
}

testAPI();