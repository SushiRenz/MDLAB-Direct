const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');

async function checkTestResults() {
  try {
    const results = await TestResult.find({ appointmentId: 'APT-20251017-016' });
    console.log('📋 Test Results for APT-20251017-016:');
    results.forEach((result, index) => {
      console.log(`Result ${index + 1}:`, JSON.stringify(result, null, 2));
    });
    
    if (results.length === 0) {
      console.log('❌ No test results found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTestResults();