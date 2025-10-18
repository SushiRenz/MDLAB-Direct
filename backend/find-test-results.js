const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');

async function findTestResults() {
  try {
    console.log('🔍 Looking for all test results...');
    
    const allResults = await TestResult.find({});
    console.log('📋 Total test results:', allResults.length);
    
    allResults.forEach((result, index) => {
      console.log(`\n=== Test Result ${index + 1} ===`);
      console.log('ID:', result._id);
      console.log('appointmentId:', result.appointmentId);
      console.log('Patient:', result.patient);
      console.log('Status:', result.status);
      console.log('Sample ID:', result.sampleId);
      if (result.results) {
        console.log('Results keys:', Array.from(result.results.keys()));
      }
    });
    
    // Specifically look for our appointment
    console.log('\n🔍 Looking specifically for APT-20251017-016...');
    const specificResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    if (specificResult) {
      console.log('✅ Found specific result:', specificResult._id);
      console.log('appointmentId field:', specificResult.appointmentId);
    } else {
      console.log('❌ No result found with appointmentId APT-20251017-016');
      
      // Check if there's one with appointment reference
      const byAppointmentRef = await TestResult.findOne({})
        .populate('appointment');
      
      if (byAppointmentRef && byAppointmentRef.appointment) {
        console.log('📋 Found result with appointment reference:');
        console.log('- appointment.appointmentId:', byAppointmentRef.appointment.appointmentId);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findTestResults();