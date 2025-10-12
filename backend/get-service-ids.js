const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    getServiceIds();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function getServiceIds() {
  try {
    const services = await Service.find({}).limit(25).select('_id serviceName price category');
    
    console.log('📋 Available services (first 25):');
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service._id} - ${service.serviceName} (₱${service.price}) [${service.category}]`);
    });
    
    console.log('\n🆔 Service IDs array for testing:');
    const serviceIds = services.slice(0, 20).map(s => s._id.toString());
    console.log(JSON.stringify(serviceIds, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting services:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}