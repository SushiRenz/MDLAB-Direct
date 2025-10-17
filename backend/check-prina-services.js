const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
require('dotenv').config();

async function checkPrinaServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find the prina appointment
    const prinaAppointment = await Appointment.findOne({
      patientName: { $regex: /prina/i }
    }).populate('service').populate('services');
    
    if (prinaAppointment) {
      console.log('Prina appointment details:');
      console.log('ID:', prinaAppointment._id);
      console.log('Patient Name:', prinaAppointment.patientName);
      console.log('Age:', prinaAppointment.age);
      console.log('Sex:', prinaAppointment.sex);
      console.log('Service Name:', prinaAppointment.serviceName);
      console.log('Single service:', prinaAppointment.service);
      console.log('Multiple services:', prinaAppointment.services);
      console.log('Status:', prinaAppointment.status);
      
      // Check test results
      console.log('\nTest results:');
      console.log('Test results data:', prinaAppointment.testResults);
      console.log('Results ready:', prinaAppointment.resultsReady);
      
    } else {
      console.log('No prina appointment found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkPrinaServices();