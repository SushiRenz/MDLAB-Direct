const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

async function getServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const services = await Service.find().limit(5);
    console.log('Available services:');
    services.forEach(service => {
      console.log(`ID: ${service._id}, Name: ${service.serviceName}, Price: ${service.price}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getServices();