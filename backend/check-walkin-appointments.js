const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

async function checkWalkInAppointments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const walkInAppointments = await Appointment.find({ 
      patient: null 
    });
    
    console.log('\n=== WALK-IN APPOINTMENTS STATUS ===');
    console.log('Total walk-in appointments found:', walkInAppointments.length);
    
    let missingAge = 0;
    let missingSex = 0;
    let missingAddress = 0;
    let completeWalkIns = 0;
    
    walkInAppointments.forEach((apt, index) => {
      console.log(`\nWalk-in ${index + 1}: ${apt.patientName}`);
      
      const hasAge = apt.age && apt.age !== null;
      const hasSex = apt.sex && apt.sex !== '' && apt.sex !== null;
      const hasAddress = apt.address && apt.address !== '' && apt.address !== null;
      
      console.log('   Age:', hasAge ? apt.age : '❌ NOT SET');
      console.log('   Sex:', hasSex ? apt.sex : '❌ NOT SET');
      console.log('   Address:', hasAddress ? apt.address : '❌ NOT SET');
      console.log('   Type:', apt.type);
      console.log('   Created:', apt.createdAt.toLocaleDateString());
      
      if (!hasAge) missingAge++;
      if (!hasSex) missingSex++;
      if (!hasAddress) missingAddress++;
      if (hasAge && hasSex && hasAddress) completeWalkIns++;
    });
    
    console.log('\n📊 WALK-IN APPOINTMENTS SUMMARY:');
    console.log('   ✅ Complete walk-ins (age + sex + address):', completeWalkIns);
    console.log('   ❌ Missing age:', missingAge);
    console.log('   ❌ Missing sex:', missingSex);
    console.log('   ❌ Missing address:', missingAddress);
    if (walkInAppointments.length > 0) {
      console.log('   🎯 Success rate:', Math.round((completeWalkIns / walkInAppointments.length) * 100) + '%');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkWalkInAppointments();