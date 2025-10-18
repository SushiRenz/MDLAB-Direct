const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');

async function fixTestResult() {
  try {
    console.log('🔧 Fixing test result appointmentId field...');
    
    // Find the test result that has patient 'walk-in-APT-20251017-016'
    const testResult = await TestResult.findOne({ 
      patient: 'walk-in-APT-20251017-016' 
    });
    
    if (!testResult) {
      console.log('❌ Test result not found');
      process.exit(1);
    }
    
    console.log('📋 Found test result:', testResult._id);
    console.log('Current appointmentId:', testResult.appointmentId);
    
    // Update it with the appointmentId field
    testResult.appointmentId = 'APT-20251017-016';
    await testResult.save();
    
    console.log('✅ Updated appointmentId field');
    
    // Verify the fix
    const updatedResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    if (updatedResult) {
      console.log('✅ Verification successful - test result now findable by appointmentId');
      console.log('Results available:', Array.from(updatedResult.results.keys()));
      console.log('Sample values:');
      console.log('- Hemoglobin:', updatedResult.results.get('hemoglobin'));
      console.log('- Blood Type:', updatedResult.results.get('bloodType'));
      console.log('- Rh Factor:', updatedResult.results.get('rhFactor'));
    } else {
      console.log('❌ Verification failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTestResult();