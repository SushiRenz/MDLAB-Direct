const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function checkPatientAppointments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const appointmentsWithPatients = await Appointment.find({
      patient: { $ne: null }
    }).populate('patient', 'firstName lastName address');
    
    console.log('\n=== APPOINTMENTS WITH PATIENT RECORDS ===');
    console.log('Total found:', appointmentsWithPatients.length);
    
    appointmentsWithPatients.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}:`);
      console.log('Patient Name:', apt.patientName); 
      console.log('Address in appointment:', JSON.stringify(apt.address));
      console.log('Patient exists:', apt.patient ? 'YES' : 'NO');
      if (apt.patient && apt.patient.address) {
        console.log('Patient address type:', typeof apt.patient.address);
        if (typeof apt.patient.address === 'string') {
          console.log('Patient address (string):', apt.patient.address);
        } else {
          console.log('Patient address (object):', JSON.stringify(apt.patient.address));
        }
      } else {
        console.log('Patient address: NOT AVAILABLE');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkPatientAppointments();