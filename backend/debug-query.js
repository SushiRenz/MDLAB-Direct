const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function debugQuery() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Test different queries
    console.log('\n🔍 TESTING QUERIES:');
    
    const emptyStringQuery = await Appointment.find({ address: '' });
    console.log('Appointments with address === "":', emptyStringQuery.length);
    
    const hasPatientQuery = await Appointment.find({ patient: { $ne: null } });
    console.log('Appointments with patient !== null:', hasPatientQuery.length);
    
    const combinedQuery = await Appointment.find({ 
      address: '',
      patient: { $ne: null } 
    });
    console.log('Appointments with empty address AND patient:', combinedQuery.length);
    
    // Let's see all appointments and their conditions
    const allAppointments = await Appointment.find({});
    console.log('\n📋 ALL APPOINTMENTS ANALYSIS:');
    
    allAppointments.forEach((apt, index) => {
      const hasPatient = apt.patient !== null;
      const hasEmptyAddress = apt.address === '';
      console.log(`\nAppointment ${index + 1}: ${apt.patientName}`);
      console.log(`   Has patient: ${hasPatient}`);
      console.log(`   Empty address: ${hasEmptyAddress}`);
      console.log(`   Address value: "${apt.address}"`);
      console.log(`   Matches query: ${hasPatient && hasEmptyAddress}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
}

debugQuery();