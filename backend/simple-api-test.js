const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Testing the API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/test-results/appointment/APT-20251017-016', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('✅ API Response received!');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    
    if (data.testResults) {
      console.log('\n📊 Test Results Found:');
      console.log('- Status:', data.testResults.status);
      console.log('- Sample ID:', data.testResults.sampleId);
      
      if (data.testResults.results) {
        const resultsMap = new Map(Object.entries(data.testResults.results));
        console.log('- Available results:', Array.from(resultsMap.keys()));
        console.log('- Hemoglobin:', resultsMap.get('hemoglobin'));
        console.log('- Blood Type:', resultsMap.get('bloodType'));
        console.log('- RBC:', resultsMap.get('rbc'));
      }
    }
    
    if (data.services) {
      console.log('\n🏷️ Services Found:');
      data.services.forEach(service => {
        console.log(`- ${service.serviceName} (${service.category})`);
      });
    }
    
    console.log('\n🎉 API is working! Frontend should now show actual values.');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();