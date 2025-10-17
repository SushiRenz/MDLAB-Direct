const mongoose = require('mongoose');
const User = require('./models/User');

async function checkPatientAddresses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    
    const patients = await User.find({ role: 'patient' });
    
    console.log('=== ALL PATIENTS ==='); 
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
      console.log('   Address:', JSON.stringify(patient.address));
      console.log('   Address is string:', typeof patient.address === 'string');
      
      if (typeof patient.address === 'string' && patient.address.trim()) {
        console.log('   ✅ HAS STRING ADDRESS:', patient.address);
      } else if (typeof patient.address === 'object' && patient.address) {
        const formatted = [
          patient.address.street, 
          patient.address.city, 
          patient.address.province, 
          patient.address.zipCode
        ].filter(Boolean).join(', ');
        console.log('   ✅ HAS OBJECT ADDRESS, formatted:', formatted);
      } else {
        console.log('   ❌ NO ADDRESS OR EMPTY');
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkPatientAddresses();