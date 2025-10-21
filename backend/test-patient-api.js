const axios = require('axios');

// Use the actual patient token from database
const patientToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzIyMGVhNTdjYjg4YWQ3M2FmYWI1YyIsImlhdCI6MTc2MDg3Mjg5MSwiZXhwIjoxNzYxNDc3NjkxfQ.9vX-n-Nz1yk7PYZCtR4i5RsL_ZcP1clsPlv7I-RMnqQ';

console.log('🔑 Using actual patient token from database');
console.log('👤 Patient ID: 68c220ea57cb88ad73afab5c');

// Test the patient endpoint
async function testPatientAPI() {
  try {
    console.log('📞 Calling patient test results API...');
    
    const response = await axios.get('http://localhost:5000/api/test-results/my', {
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response received!');
    console.log('📊 Status:', response.status);
    console.log('📋 Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ API Error:', error.response?.data || error.message);
  }
}

// Run the test
testPatientAPI();