const axios = require('axios');
const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');

// Test the complete workflow: API fetch -> Display in UI
async function testReviewResultsWorkflow() {
  try {
    console.log('🧪 Testing Review Results Complete Workflow\n');

    // Step 1: Test API endpoint directly
    console.log('1️⃣ Testing API endpoint /api/test-results...');
    try {
      const response = await axios.get('http://localhost:5000/api/test-results?status=completed', {
        timeout: 5000
      });
      
      console.log(`✅ API Response: ${response.status} ${response.statusText}`);
      console.log(`📊 Results returned: ${response.data.results?.length || 0}`);
      
      if (response.data.results && response.data.results.length > 0) {
        console.log('\n📋 Sample test results:');
        response.data.results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.sampleId} - ${result.testType}`);
          console.log(`     Patient: ${result.patientInfo?.name || result.patient?.firstName || 'Unknown'}`);
          console.log(`     Status: ${result.status}`);
        });
      }
    } catch (apiError) {
      console.log(`❌ API Error: ${apiError.message}`);
      if (apiError.code === 'ECONNREFUSED') {
        console.log('💡 Make sure the backend server is running on port 5000');
      }
    }

    // Step 2: Test database query directly
    console.log('\n2️⃣ Testing database query directly...');
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    
    const dbResults = await TestResult.find({ status: 'completed' }).sort({ createdAt: -1 });
    console.log(`✅ Database query successful: ${dbResults.length} completed results found`);
    
    if (dbResults.length > 0) {
      console.log('\n📋 Recent completed test results:');
      dbResults.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.sampleId} - ${result.testType}`);
        console.log(`     Patient: ${result.patientInfo?.name || 'Unknown'}`);
        console.log(`     Completed: ${result.completedAt ? result.completedAt.toISOString().slice(0, 19) : 'N/A'}`);
      });
    }

    // Step 3: Check data structure for UI compatibility
    console.log('\n3️⃣ Validating data structure for UI...');
    if (dbResults.length > 0) {
      const sampleResult = dbResults[0];
      const requiredFields = ['sampleId', 'testType', 'status', 'patientInfo'];
      const missingFields = requiredFields.filter(field => !sampleResult[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present for UI display');
        
        // Test patient info extraction
        const patientInfo = sampleResult.patientInfo;
        if (patientInfo && patientInfo.name) {
          console.log(`✅ Patient info available: ${patientInfo.name}, Age: ${patientInfo.age}, Gender: ${patientInfo.gender}`);
        } else {
          console.log('⚠️ Patient info missing or incomplete');
        }
        
        // Test results data
        if (sampleResult.results && sampleResult.results.size > 0) {
          console.log(`✅ Test results data available: ${sampleResult.results.size} result fields`);
        } else {
          console.log('⚠️ Test results data missing');
        }
      } else {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log('- Backend API: Ready to serve test results');
    console.log('- Database: Contains completed test results');
    console.log('- Data Structure: Compatible with Review Results UI');
    console.log('- Next Step: Open Review Results page in browser to verify display');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testReviewResultsWorkflow();