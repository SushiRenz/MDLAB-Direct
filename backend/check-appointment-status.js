const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');

async function checkAppointments() {
  try {
    console.log('📋 Checking appointments...');
    const appointments = await Appointment.find({ appointmentId: 'APT-20251017-016' }).populate('services');
    
    if (appointments.length === 0) {
      console.log('❌ No appointment found with ID APT-20251017-016');
      process.exit(0);
    }
    
    console.log('Found appointment:', JSON.stringify(appointments[0], null, 2));
    
    // Check if test results exist
    console.log('\n📋 Checking test results...');
    const testResults = await TestResult.find({ appointmentId: 'APT-20251017-016' });
    console.log('Test results count:', testResults.length);
    
    if (testResults.length > 0) {
      testResults.forEach((result, index) => {
        console.log(`Test Result ${index + 1}:`, JSON.stringify(result, null, 2));
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAppointments();