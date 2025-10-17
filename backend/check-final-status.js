const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

async function checkFinalStatus() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const appointmentsWithPatients = await Appointment.find({ 
      patient: { $exists: true, $ne: null } 
    });
    
    console.log('\n=== FINAL STATUS OF PATIENT APPOINTMENTS ===');
    console.log('Total appointments with patient records:', appointmentsWithPatients.length);
    
    let missingAge = 0;
    let missingSex = 0;
    let missingAddress = 0;
    let allDataComplete = 0;
    
    appointmentsWithPatients.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}: ${apt.patientName}`);
      
      const hasAge = apt.age && apt.age !== null;
      const hasSex = apt.sex && apt.sex !== '';
      const hasAddress = apt.address && apt.address !== '';
      
      console.log('   Age:', hasAge ? apt.age : '❌ MISSING');
      console.log('   Sex:', hasSex ? apt.sex : '❌ MISSING');
      console.log('   Address:', hasAddress ? apt.address : '❌ MISSING');
      
      if (!hasAge) missingAge++;
      if (!hasSex) missingSex++;
      if (!hasAddress) missingAddress++;
      if (hasAge && hasSex && hasAddress) allDataComplete++;
    });
    
    console.log('\n📊 SUMMARY:');
    console.log('   ✅ Complete appointments (age + sex + address):', allDataComplete);
    console.log('   ❌ Missing age:', missingAge);
    console.log('   ❌ Missing sex:', missingSex); 
    console.log('   ❌ Missing address:', missingAddress);
    console.log('   🎯 Success rate:', Math.round((allDataComplete / appointmentsWithPatients.length) * 100) + '%');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkFinalStatus();