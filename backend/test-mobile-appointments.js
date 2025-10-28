const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/mdlab-direct';

async function testMobileAppointments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find the test patient
    const testPatient = await User.findOne({ email: 'patient@test.com' });
    
    if (!testPatient) {
      console.log('❌ Test patient (patient@test.com) not found');
      return;
    }
    
    console.log('👤 TEST PATIENT INFO:');
    console.log('   ID:', testPatient._id.toString());
    console.log('   Name:', `${testPatient.firstName} ${testPatient.lastName}`);
    console.log('   Email:', testPatient.email);
    console.log('   Username:', testPatient.username);
    console.log('   Patient ID:', testPatient.patientId);
    console.log('');
    
    // Get all appointments for this patient
    console.log('📋 SEARCHING FOR APPOINTMENTS...');
    console.log('   Query: { patient:', testPatient._id.toString(), '}');
    console.log('');
    
    const appointments = await Appointment.find({ patient: testPatient._id })
      .populate('patient', 'firstName lastName email patientId')
      .populate('services', 'serviceName price')
      .sort({ appointmentDate: -1 });
    
    if (appointments.length === 0) {
      console.log('⚠️ NO APPOINTMENTS FOUND for this patient');
      console.log('');
      console.log('🔍 Checking if any appointments exist with different patient references...');
      
      // Check by patientName
      const byName = await Appointment.find({ 
        patientName: new RegExp(testPatient.firstName, 'i') 
      }).limit(5);
      
      if (byName.length > 0) {
        console.log(`\n✅ Found ${byName.length} appointments matching name "${testPatient.firstName}"`);
        byName.forEach((apt, idx) => {
          console.log(`\n   ${idx + 1}. Appointment ${apt.appointmentId}`);
          console.log('      patient field:', apt.patient?.toString() || 'NULL');
          console.log('      patientName:', apt.patientName);
          console.log('      email:', apt.email);
          console.log('      service:', apt.serviceName);
          console.log('      date:', apt.appointmentDate);
          console.log('      status:', apt.status);
          console.log('      ⚠️ MISMATCH: patient field does not match user._id');
        });
      }
      
    } else {
      console.log(`✅ FOUND ${appointments.length} APPOINTMENTS for this patient:\n`);
      
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. Appointment ${apt.appointmentId}`);
        console.log('   Patient:', apt.patient?.firstName, apt.patient?.lastName, `(${apt.patient?.patientId})`);
        console.log('   Service:', apt.serviceName);
        console.log('   Services array:', apt.services?.map(s => s.serviceName).join(', ') || 'N/A');
        console.log('   Date:', apt.appointmentDate);
        console.log('   Time:', apt.appointmentTime);
        console.log('   Status:', apt.status);
        console.log('   Type:', apt.type);
        console.log('   Created:', apt.createdAt);
        console.log('');
      });
    }
    
    // Show all appointments in database for comparison
    console.log('\n📊 ALL APPOINTMENTS IN DATABASE:');
    const allAppointments = await Appointment.countDocuments();
    console.log(`   Total: ${allAppointments} appointments`);
    
    const recentAppointments = await Appointment.find()
      .populate('patient', 'firstName lastName email patientId')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n   Recent 5 appointments:');
    recentAppointments.forEach((apt, idx) => {
      console.log(`   ${idx + 1}. ${apt.appointmentId} - ${apt.patientName} - ${apt.serviceName} - ${apt.status}`);
      console.log(`      patient._id: ${apt.patient?._id?.toString() || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('🚨 Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMobileAppointments();
