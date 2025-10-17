const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function findPatients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const patients = await User.find({ role: 'patient' }).limit(3);
    console.log('Available patients:');
    patients.forEach(patient => {
      console.log(`ID: ${patient._id}, Name: ${patient.firstName} ${patient.lastName}, Email: ${patient.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

findPatients();