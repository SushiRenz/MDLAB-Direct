const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');
const Appointment = require('./models/Appointment');

async function fixTestResultAppointmentReference() {
  try {
    console.log('🔧 Fixing test result appointment reference...');
    
    // Get the appointment ObjectId
    const appointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' });
    
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('📋 Found appointment:', appointment._id);
    
    // Update the test result to have the correct appointment ObjectId
    const result = await TestResult.updateOne(
      { patient: 'walk-in-APT-20251017-016' },
      { $set: { appointment: appointment._id } }
    );
    
    console.log('Update result:', result);
    
    // Verify the fix
    const testResult = await TestResult.findOne({ appointment: appointment._id });
    
    if (testResult) {
      console.log('✅ SUCCESS! Test result now linked to appointment');
      console.log('Test result ID:', testResult._id);
      console.log('Appointment reference:', testResult.appointment);
      console.log('Patient:', testResult.patient);
      console.log('Status:', testResult.status);
      console.log('Available results:', Array.from(testResult.results.keys()));
      
      // Show actual values
      console.log('\n📊 Test values that will now be accessible:');
      console.log('- Hemoglobin:', testResult.results.get('hemoglobin'));
      console.log('- Hematocrit:', testResult.results.get('hematocrit'));
      console.log('- RBC:', testResult.results.get('rbc'));
      console.log('- WBC:', testResult.results.get('wbc'));
      console.log('- Platelet Count:', testResult.results.get('plateletCount'));
      console.log('- Blood Type:', testResult.results.get('bloodType'));
      console.log('- Rh Factor:', testResult.results.get('rhFactor'));
      console.log('- ESR:', testResult.results.get('esr'));
    } else {
      console.log('❌ Verification failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTestResultAppointmentReference();