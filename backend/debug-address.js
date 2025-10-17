const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function debugAddressIssue() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');

    // Get the first appointment with empty address that has a patient
    const appointment = await Appointment.findOne({
      address: '',
      patient: { $ne: null }
    }).populate('patient', 'firstName lastName address');

    if (!appointment) {
      console.log('❌ No appointment found with empty address and patient');
      return;
    }

    console.log('\n🔍 DEBUGGING APPOINTMENT:');
    console.log('Patient Name:', appointment.patientName);
    console.log('Appointment Address:', JSON.stringify(appointment.address));
    console.log('Patient Record:', appointment.patient ? 'EXISTS' : 'NULL');
    
    if (appointment.patient) {
      console.log('\n👤 PATIENT DETAILS:');
      console.log('Patient Name:', appointment.patient.firstName, appointment.patient.lastName);
      console.log('Patient Address:', JSON.stringify(appointment.patient.address));
      console.log('Patient Address Type:', typeof appointment.patient.address);
      
      let formattedAddress = '';
      if (typeof appointment.patient.address === 'string') {
        formattedAddress = appointment.patient.address;
        console.log('String Address:', formattedAddress);
      } else if (typeof appointment.patient.address === 'object') {
        formattedAddress = [
          appointment.patient.address.street,
          appointment.patient.address.city,
          appointment.patient.address.province,
          appointment.patient.address.zipCode
        ].filter(Boolean).join(', ');
        console.log('Object Address Formatted:', formattedAddress);
      }
      
      console.log('\n✅ WOULD UPDATE TO:', formattedAddress);
      
      // Actually update this one
      if (formattedAddress) {
        await Appointment.findByIdAndUpdate(appointment._id, { address: formattedAddress });
        console.log('🎉 ADDRESS UPDATED SUCCESSFULLY!');
        
        // Verify the update
        const updatedAppointment = await Appointment.findById(appointment._id);
        console.log('Verified address:', JSON.stringify(updatedAppointment.address));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
}

debugAddressIssue();