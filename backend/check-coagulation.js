const mongoose = require('mongoose');
const Service = require('./models/Service');

async function checkCoagulationTests() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mdlab');
    console.log('Connected to database');

    // Check for APTT and PT tests
    const coagulationTests = await Service.find({
      $or: [
        { serviceName: { $regex: 'APTT', $options: 'i' } },
        { serviceName: { $regex: 'PT', $options: 'i' } },
        { serviceName: { $regex: 'Prothrombin', $options: 'i' } }
      ]
    });
    
    console.log('\n=== COAGULATION TESTS SEARCH ===');
    console.log('Found:', coagulationTests.length, 'tests');
    
    coagulationTests.forEach(service => {
      console.log(`- ${service.serviceName}: ₱${service.price} (Category: ${service.category})`);
    });
    
    if (coagulationTests.length === 0) {
      console.log('No coagulation tests found. Need to add them.');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCoagulationTests();