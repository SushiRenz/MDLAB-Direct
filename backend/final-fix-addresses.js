const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function finalFixAddresses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Get all appointments with patient records
    const appointmentsWithPatients = await Appointment.find({}).populate('patient', 'firstName lastName address');
    
    console.log(`\n📋 Processing appointments with patient records`);

    let fixedCount = 0;

    for (const appointment of appointmentsWithPatients) {
      // Only process appointments with patients and empty/missing addresses
      if (appointment.patient && (!appointment.address || appointment.address === '')) {
        console.log(`\n🔧 Processing: ${appointment.patientName} (ID: ${appointment._id})`);
        
        const patientAddress = appointment.patient.address;
        let addressToSet = '';
        
        if (patientAddress) {
          console.log(`   📋 Raw patient address:`, JSON.stringify(patientAddress));
          console.log(`   📋 Type:`, typeof patientAddress);
          
          // Check if it's actually a string (even if typeof shows object)
          if (typeof patientAddress === 'string') {
            addressToSet = patientAddress;
            console.log(`   📍 Using string address: "${addressToSet}"`);
          } else if (patientAddress.street || patientAddress.city) {
            // It's an object with address components
            addressToSet = [
              patientAddress.street,
              patientAddress.city,
              patientAddress.province,
              patientAddress.zipCode
            ].filter(Boolean).join(', ');
            console.log(`   📍 Formatted object address: "${addressToSet}"`);
          } else {
            // It might be a string stored as an object - try converting
            addressToSet = String(patientAddress);
            console.log(`   📍 Converted to string: "${addressToSet}"`);
          }
          
          if (addressToSet && addressToSet !== 'undefined' && addressToSet !== 'null') {
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
            console.log('   ⚠️  No valid address to set');
          }
        } else {
          console.log('   ⚠️  Patient has no address data');
        }
      }
    }

    console.log(`\n🎉 SUMMARY: Fixed ${fixedCount} appointments!`);

    // Final verification - show fixed appointments
    console.log('\n🔍 FINAL VERIFICATION:');
    const appointmentsWithPatientRecords = await Appointment.find({ 
      patient: { $exists: true, $ne: null } 
    }).limit(5);
    
    appointmentsWithPatientRecords.forEach((apt, index) => {
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

console.log('🔧 FINAL ADDRESS FIX WITH BETTER TYPE HANDLING...\n');
finalFixAddresses();