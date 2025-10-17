const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function fixEmptyAddresses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Find appointments with empty addresses but with patient records
    const emptyAddressAppointments = await Appointment.find({
      address: '',
      patient: { $ne: null }
    }).populate('patient', 'firstName lastName address');

    console.log(`\n📋 Found ${emptyAddressAppointments.length} appointments with empty addresses`);

    let fixedCount = 0;

    for (const appointment of emptyAddressAppointments) {
      console.log(`\n🔧 Fixing: ${appointment.patientName}`);
      
      if (appointment.patient && appointment.patient.address) {
        let addressToSet = appointment.patient.address;
        
        // If it's an object, format it; if it's a string, use as-is
        if (typeof addressToSet === 'object' && addressToSet !== null) {
          addressToSet = [
            addressToSet.street,
            addressToSet.city,
            addressToSet.province,
            addressToSet.zipCode
          ].filter(Boolean).join(', ');
        }
        
        console.log(`   📍 Setting address to: "${addressToSet}"`);
        
        await Appointment.findByIdAndUpdate(appointment._id, { 
          address: addressToSet 
        });
        
        fixedCount++;
        console.log('   ✅ Updated successfully');
      } else {
        console.log('   ⚠️  No address data available');
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} appointments!`);

    // Verify the fixes
    console.log('\n🔍 VERIFICATION:');
    const verifyAppointments = await Appointment.find({ 
      patient: { $ne: null } 
    }).populate('patient', 'firstName lastName').limit(3);
    
    verifyAppointments.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}: ${apt.patientName}`);
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

console.log('🔧 FIXING EMPTY ADDRESSES...\n');
fixEmptyAddresses();