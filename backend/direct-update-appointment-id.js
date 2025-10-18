const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');

async function directUpdate() {
  try {
    console.log('🔧 Direct update of appointmentId field...');
    
    const result = await TestResult.updateOne(
      { patient: 'walk-in-APT-20251017-016' },
      { $set: { appointmentId: 'APT-20251017-016' } }
    );
    
    console.log('Update result:', result);
    
    // Verify
    const testResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    if (testResult) {
      console.log('✅ SUCCESS! Test result now has appointmentId');
      console.log('appointmentId:', testResult.appointmentId);
      console.log('Patient:', testResult.patient);
      console.log('Status:', testResult.status);
      console.log('Available results:', Array.from(testResult.results.keys()));
      
      // Show actual values
      console.log('\n📊 Actual test values:');
      console.log('- Hemoglobin:', testResult.results.get('hemoglobin'));
      console.log('- Hematocrit:', testResult.results.get('hematocrit'));
      console.log('- RBC:', testResult.results.get('rbc'));
      console.log('- WBC:', testResult.results.get('wbc'));
      console.log('- Platelet Count:', testResult.results.get('plateletCount'));
      console.log('- Blood Type:', testResult.results.get('bloodType'));
      console.log('- Rh Factor:', testResult.results.get('rhFactor'));
      console.log('- ESR:', testResult.results.get('esr'));
    } else {
      console.log('❌ Still not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

directUpdate();