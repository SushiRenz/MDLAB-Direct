const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testPatientIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all patients
    const patients = await User.find({ role: 'patient' }).select('firstName lastName email patientId');
    
    console.log('\n📋 Patient ID Report:');
    console.log('=' .repeat(60));
    
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
      console.log(`   Email: ${patient.email}`);
      console.log(`   Patient ID: ${patient.patientId || 'NOT ASSIGNED'}`);
      console.log(`   MongoDB ID: ${patient._id}`);
      console.log('-'.repeat(40));
    });

    console.log(`\n✅ Total patients: ${patients.length}`);
    console.log(`✅ Patients with IDs: ${patients.filter(p => p.patientId).length}`);
    console.log(`❌ Patients without IDs: ${patients.filter(p => !p.patientId).length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testPatientIds();