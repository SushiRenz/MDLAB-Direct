const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

async function checkAppointmentStatuses() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('📡 Connected to MongoDB');

    // Get all appointments to see their status values
    const appointments = await Appointment.find({})
      .select('appointmentId patientName status appointmentDate appointmentTime')
      .sort({ appointmentDate: -1 });
    
    console.log('\n📋 Current Appointments and Their Statuses:');
    console.log('='.repeat(80));
    
    const statusCount = {};
    
    appointments.forEach(appt => {
      const status = appt.status;
      if (!statusCount[status]) {
        statusCount[status] = 0;
      }
      statusCount[status]++;
      
      console.log(`${appt.appointmentId} | ${appt.patientName.padEnd(20)} | ${status.padEnd(15)} | ${appt.appointmentDate.toDateString()}`);
    });
    
    console.log('\n📊 Status Summary:');
    console.log('='.repeat(40));
    Object.keys(statusCount).forEach(status => {
      console.log(`${status}: ${statusCount[status]} appointments`);
    });
    
    // Specifically look for checked-in appointments
    console.log('\n🔍 Searching for checked-in appointments (various formats):');
    console.log('='.repeat(60));
    
    const checkedInLower = await Appointment.find({ status: 'checked-in' });
    const checkedInUpper = await Appointment.find({ status: 'CHECKED-IN' });
    const checkedInTitle = await Appointment.find({ status: 'Checked-in' });
    const checkedInMixed = await Appointment.find({ status: 'Checked-In' });
    
    console.log(`checked-in (lowercase): ${checkedInLower.length} found`);
    console.log(`CHECKED-IN (uppercase): ${checkedInUpper.length} found`);
    console.log(`Checked-in (title case): ${checkedInTitle.length} found`);
    console.log(`Checked-In (mixed case): ${checkedInMixed.length} found`);
    
    if (checkedInLower.length > 0) {
      console.log('\nChecked-in appointments (lowercase):');
      checkedInLower.forEach(appt => {
        console.log(`  - ${appt.patientName} (${appt.appointmentId})`);
      });
    }
    
    if (checkedInUpper.length > 0) {
      console.log('\nCHECKED-IN appointments (uppercase):');
      checkedInUpper.forEach(appt => {
        console.log(`  - ${appt.patientName} (${appt.appointmentId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking appointments:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAppointmentStatuses();