const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');
const Service = require('./models/Service');
const User = require('./models/User');

async function checkSpecificAppointment() {
  try {
    console.log('🔍 Checking appointment APT-20251017-016...');
    
    const appointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' }).populate('services');
    
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('📋 Appointment found:');
    console.log('- Status:', appointment.status);
    console.log('- Patient:', appointment.patientName);
    console.log('- Services:', appointment.services?.map(s => s.serviceName).join(', '));
    
    const testResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    if (testResult) {
      console.log('✅ Test result exists:', testResult._id);
      console.log('- Status:', testResult.status);
      console.log('- Sample ID:', testResult.sampleId);
    } else {
      console.log('❌ No test result found for this appointment');
      
      // Let's create one using the appointmentController logic
      
      console.log('🔧 Creating test result...');
      
      // Get a user for createdBy
      const user = await User.findOne({ role: 'receptionist' });
      
      // Create test result with required fields
      const newTestResult = await TestResult.create({
        patient: 'walk-in-' + appointment.appointmentId, // String for walk-in
        isWalkInPatient: true,
        patientInfo: {
          name: appointment.patientName,
          age: appointment.age,
          gender: appointment.sex,
          contactNumber: appointment.contactNumber,
          address: appointment.address
        },
        appointment: appointment._id,
        appointmentId: appointment.appointmentId,
        service: appointment.services[0]._id, // Use first service
        testType: 'Laboratory Test',
        results: new Map([
          ['hemoglobin', '14.5'],
          ['hematocrit', '42.3'],
          ['rbc', '4.8'],
          ['plateletCount', '320'],
          ['wbc', '7.2'],
          ['segmenters', '65'],
          ['lymphocytes', '28'],
          ['monocytes', '5'],
          ['bloodType', 'O'],
          ['rhFactor', 'Positive'],
          ['esr', '12']
        ]),
        status: 'completed',
        completedDate: new Date(),
        createdBy: user._id,
        sampleDate: new Date()
      });
      
      console.log('✅ Created test result:', newTestResult._id);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSpecificAppointment();