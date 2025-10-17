const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
require('dotenv').config();

async function testAppointmentSave() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Create a test appointment with age and sex
    const testAppointment = new Appointment({
      patientName: 'Test Patient With Age',
      contactNumber: '+639123456789',
      email: 'test@example.com',
      age: 30,
      sex: 'Female',
      serviceName: 'Test Service',
      appointmentDate: new Date('2025-10-18'),
      appointmentTime: '10:00 AM',
      type: 'scheduled',
      priority: 'regular',
      notes: 'Test appointment with age and sex',
      reasonForVisit: 'Testing',
      estimatedCost: 500,
      totalPrice: 500,
      createdBy: new mongoose.Types.ObjectId(), // Mock creator ID
      createdByName: 'Test Creator'
    });
    
    console.log('Before save:');
    console.log('Age:', testAppointment.age, typeof testAppointment.age);
    console.log('Sex:', testAppointment.sex, typeof testAppointment.sex);
    
    const savedAppointment = await testAppointment.save();
    
    console.log('After save:');
    console.log('Age:', savedAppointment.age, typeof savedAppointment.age);
    console.log('Sex:', savedAppointment.sex, typeof savedAppointment.sex);
    
    // Fetch it back from database
    const fetchedAppointment = await Appointment.findById(savedAppointment._id);
    
    console.log('After fetch:');
    console.log('Age:', fetchedAppointment.age, typeof fetchedAppointment.age);
    console.log('Sex:', fetchedAppointment.sex, typeof fetchedAppointment.sex);
    
    // Clean up
    await Appointment.findByIdAndDelete(savedAppointment._id);
    console.log('Test appointment deleted');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAppointmentSave();