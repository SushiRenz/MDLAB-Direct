const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function forceFixAddresses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Get all appointments and manually filter
    const allAppointments = await Appointment.find({}).populate('patient', 'firstName lastName address');
    
    console.log(`\n📋 Processing ${allAppointments.length} total appointments`);

    let fixedCount = 0;

    for (const appointment of allAppointments) {
      // Manual filtering: has patient AND empty address
      if (appointment.patient && appointment.address === '') {
        console.log(`\n🔧 Fixing: ${appointment.patientName} (ID: ${appointment._id})`);
        
        let addressToSet = appointment.patient.address;
        
        if (addressToSet) {
          // Handle both string and object addresses
          if (typeof addressToSet === 'object' && addressToSet !== null) {
            addressToSet = [
              addressToSet.street,
              addressToSet.city,
              addressToSet.province,
              addressToSet.zipCode
            ].filter(Boolean).join(', ');
          }
          
          console.log(`   📍 Setting address to: "${addressToSet}"`);
          
          const updateResult = await Appointment.updateOne(
            { _id: appointment._id },
            { address: addressToSet }
          );
          
          if (updateResult.modifiedCount > 0) {
            fixedCount++;
            console.log('   ✅ Updated successfully');
          } else {
            console.log('   ❌ Update failed');
          }
        } else {
          console.log('   ⚠️  Patient has no address data');
        }
      }
    }

    console.log(`\n🎉 SUMMARY: Fixed ${fixedCount} appointments!`);

    // Final verification
    console.log('\n🔍 FINAL VERIFICATION:');
    const finalCheck = await Appointment.find({ patient: { $exists: true } }).limit(5);
    
    finalCheck.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}: ${apt.patientName}`);
      console.log(`   Age: ${apt.age || 'NOT SET'}`);
      console.log(`   Sex: ${apt.sex || 'NOT SET'}`);
      console.log(`   Address: "${apt.address}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
}

console.log('🔧 FORCE FIXING APPOINTMENTS WITH MANUAL FILTERING...\n');
forceFixAddresses();