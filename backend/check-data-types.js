const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

async function checkDataTypes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    
    const apt = await Appointment.findOne({ patientName: 'Renz Ramos' });
    console.log('First Renz appointment:');
    console.log('Patient ObjectId:', apt.patient);
    console.log('Patient type:', typeof apt.patient);
    console.log('Patient is null:', apt.patient === null);
    console.log('Patient exists check (!== null):', apt.patient !== null);
    console.log('Address:', JSON.stringify(apt.address));
    console.log('Address type:', typeof apt.address);
    console.log('Address === empty string:', apt.address === '');
    
    // Try manual update of this specific appointment
    console.log('\n🔧 Attempting manual update...');
    const updateResult = await Appointment.updateOne(
      { _id: apt._id },
      { address: 'MANUALLY SET TEST ADDRESS' }
    );
    console.log('Update result:', updateResult);
    
    // Check if it worked
    const updatedApt = await Appointment.findById(apt._id);
    console.log('New address:', updatedApt.address);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkDataTypes();