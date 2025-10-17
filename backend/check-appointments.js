const mongoose = require('mongoose');
require('dotenv').config();

async function checkAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const Appointment = require('./models/Appointment');
    
    // Check all appointments
    const allAppointments = await Appointment.find().sort({createdAt: -1});
    console.log(`Total appointments found: ${allAppointments.length}`);
    
    // Look specifically for appointments with patient name "prima"
    const primaAppointments = await Appointment.find({
      patientName: { $regex: /prima/i }
    });
    
    console.log(`\nAppointments for "prima": ${primaAppointments.length}`);
    
    if (primaAppointments.length > 0) {
      primaAppointments.forEach(apt => {
        console.log(`- ID: ${apt._id}`);
        console.log(`  Patient: ${apt.patientName}`);
        console.log(`  Age: ${apt.age}`);
        console.log(`  Sex: ${apt.sex}`);
        console.log(`  Status: ${apt.status}`);
        console.log(`  Service: ${apt.serviceName}`);
        console.log(`  Contact: ${apt.contactNumber}`);
        console.log(`  Email: ${apt.email}`);
        console.log(`  Created: ${apt.createdAt}`);
        console.log('');
      });
    }
    
    // Show all recent appointments regardless
    console.log('\nAll recent appointments:');
    allAppointments.slice(0, 5).forEach(apt => {
      console.log(`- ID: ${apt._id}`);
      console.log(`  Patient: ${apt.patientName}`);
      console.log(`  Age: ${apt.age}`);
      console.log(`  Sex: ${apt.sex}`);
      console.log(`  Status: ${apt.status}`);
      console.log(`  Service: ${apt.serviceName}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAppointments();