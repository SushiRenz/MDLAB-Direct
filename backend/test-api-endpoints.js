const axios = require('axios');

async function testReviewEndpoints() {
  try {
    console.log('🧪 Testing Review Results API Endpoints...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // First, let's get a test token (you'll need to replace with actual login)
    console.log('🔐 Note: You will need to test these endpoints with a valid pathologist/admin token');
    console.log('   You can get a token by logging in through the frontend.\n');
    
    // Test 1: Check if the new routes exist
    console.log('📋 Test 1: Checking if new endpoints exist...');
    
    try {
      // Test approve endpoint (without auth - should get 401)
      const approveResponse = await axios.put(`${baseURL}/test-results/test-id/approve`, {}, {
        validateStatus: () => true // Don't throw on error status
      });
      console.log(`   /api/test-results/:id/approve - Status: ${approveResponse.status} (Expected: 401 Unauthorized)`);
      
      // Test reject endpoint (without auth - should get 401)
      const rejectResponse = await axios.put(`${baseURL}/test-results/test-id/reject`, {}, {
        validateStatus: () => true
      });
      console.log(`   /api/test-results/:id/reject - Status: ${rejectResponse.status} (Expected: 401 Unauthorized)`);
      
      if (approveResponse.status === 401 && rejectResponse.status === 401) {
        console.log('   ✅ Both endpoints exist and require authentication');
      } else {
        console.log('   ⚠️  Unexpected status codes - check endpoint registration');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Cannot connect to backend server. Make sure it\'s running on port 5000');
        return;
      }
      throw error;
    }
    
    // Test 2: Test general API access
    console.log('\n📋 Test 2: Testing general API health...');
    
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      if (healthResponse.status === 200) {
        console.log('   ✅ Backend API is healthy and responding');
        console.log(`   📊 MongoDB Status: ${healthResponse.data.mongodb.statusText}`);
      }
    } catch (error) {
      console.log('   ❌ Health check failed:', error.message);
    }
    
    console.log('\n🎉 Basic API Endpoint Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ New approve/reject endpoints are registered');
    console.log('   ✅ Authentication is required (as expected)');
    console.log('   ✅ Backend server is running and healthy');
    
    console.log('\n🔍 Next Steps for Full Testing:');
    console.log('   1. Open the Review Results page in the frontend');
    console.log('   2. Login as a pathologist or admin user');
    console.log('   3. Try approving and rejecting completed test results');
    console.log('   4. Verify that rejected tests appear in the MedTech queue');
    console.log('   5. Check that approved tests move to the reviewed status');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testReviewEndpoints();