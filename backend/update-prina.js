const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
require('dotenv').config();

async function updatePrinaAppointment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find the prina appointment
    const prinaAppointment = await Appointment.findOne({
      patientName: { $regex: /prina/i }
    });
    
    if (prinaAppointment) {
      console.log('Found prina appointment:');
      console.log('ID:', prinaAppointment._id);
      console.log('Current age:', prinaAppointment.age);
      console.log('Current sex:', prinaAppointment.sex);
      
      // Update with age and sex
      prinaAppointment.age = 25;
      prinaAppointment.sex = 'Female';
      
      await prinaAppointment.save();
      
      console.log('Updated prina appointment:');
      console.log('New age:', prinaAppointment.age);
      console.log('New sex:', prinaAppointment.sex);
      
      // Fetch it back to confirm
      const updatedAppointment = await Appointment.findById(prinaAppointment._id);
      console.log('Confirmed from database:');
      console.log('Age:', updatedAppointment.age);
      console.log('Sex:', updatedAppointment.sex);
      
    } else {
      console.log('No prina appointment found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePrinaAppointment();