const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function fixExistingAppointments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Get all appointments that need fixing (missing age/sex/address)
    const appointmentsToFix = await Appointment.find({
      $or: [
        { age: { $exists: false } },
        { age: null },
        { sex: { $exists: false } },
        { sex: null },
        { sex: '' },
        { address: { $exists: false } },
        { address: null },
        { address: '' }
      ]
    }).populate('patient', 'firstName lastName email phone address dateOfBirth gender');

    console.log(`\n📋 Found ${appointmentsToFix.length} appointments that need fixing`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const appointment of appointmentsToFix) {
      console.log(`\n🔧 Processing appointment: ${appointment.patientName}`);
      
      if (!appointment.patient) {
        console.log('   ⚠️  Skipping - No patient record (walk-in appointment)');
        skippedCount++;
        continue;
      }

      const patient = appointment.patient;
      let updated = false;
      const updates = {};

      // Fix age
      if (!appointment.age && patient.age) {
        updates.age = patient.age;
        console.log(`   📅 Setting age: ${patient.age}`);
        updated = true;
      }

      // Fix sex/gender
      if (!appointment.sex && patient.gender) {
        const formattedSex = patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase();
        updates.sex = formattedSex;
        console.log(`   👤 Setting sex: ${formattedSex}`);
        updated = true;
      }

      // Fix address - handle both string and object formats
      if ((!appointment.address || appointment.address === '') && patient.address) {
        let formattedAddress = '';
        
        if (typeof patient.address === 'string') {
          formattedAddress = patient.address;
        } else if (typeof patient.address === 'object') {
          formattedAddress = [
            patient.address.street,
            patient.address.city,
            patient.address.province,
            patient.address.zipCode
          ].filter(Boolean).join(', ');
        }
        
        if (formattedAddress) {
          updates.address = formattedAddress;
          console.log(`   📍 Setting address: ${formattedAddress}`);
          updated = true;
        }
      }

      if (updated) {
        await Appointment.findByIdAndUpdate(appointment._id, updates);
        console.log('   ✅ Updated successfully');
        fixedCount++;
      } else {
        console.log('   ➡️  No updates needed');
      }
    }

    console.log(`\n🎉 SUMMARY:`);
    console.log(`   ✅ Fixed: ${fixedCount} appointments`);
    console.log(`   ⚠️  Skipped: ${skippedCount} appointments (walk-ins)`);
    console.log(`   📊 Total processed: ${appointmentsToFix.length} appointments`);

    // Verify the fixes
    console.log(`\n🔍 VERIFICATION - Checking first 3 fixed appointments:`);
    const verifyAppointments = await Appointment.find({ age: { $exists: true, $ne: null } }).limit(3);
    
    verifyAppointments.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}: ${apt.patientName}`);
      console.log(`   Age: ${apt.age || 'STILL MISSING'}`);
      console.log(`   Sex: ${apt.sex || 'STILL MISSING'}`);
      console.log(`   Address: ${apt.address || 'STILL MISSING'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing appointments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
}

console.log('🔧 FIXING EXISTING APPOINTMENTS WITH MISSING DATA...\n');
fixExistingAppointments();