const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const Service = require('./models/Service'); // Need to import Service model

async function listRecentAppointments() {
  try {
    console.log('📋 Listing recent appointments...');
    const appointments = await Appointment.find()
      .populate('services')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${appointments.length} appointments:`);
    
    appointments.forEach((appointment, index) => {
      console.log(`\n=== Appointment ${index + 1} ===`);
      console.log('ID:', appointment.appointmentId);
      console.log('Patient:', appointment.patientName);
      console.log('Status:', appointment.status);
      console.log('Date:', appointment.appointmentDate);
      console.log('Services:', appointment.services?.map(s => s.serviceName).join(', '));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listRecentAppointments();