const mongoose = require('mongoose');
const Service = require('./models/Service');

async function checkHematologyServices() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mdlab');
    console.log('Connected to database');

    const hematologyServices = await Service.find({ category: 'hematology' });
    
    console.log('\n=== HEMATOLOGY SERVICES ===');
    console.log('Total:', hematologyServices.length);
    
    hematologyServices.forEach(service => {
      console.log(`- ${service.serviceName}: ₱${service.price}`);
    });
    
    // Check specifically for APTT and PT
    const aptt = hematologyServices.find(s => s.serviceName.includes('APTT'));
    const pt = hematologyServices.find(s => s.serviceName.includes('PT') || s.serviceName.includes('Prothrombin'));
    
    console.log('\n=== COAGULATION TESTS ===');
    console.log('APTT found:', aptt ? `${aptt.serviceName} - ₱${aptt.price}` : 'NOT FOUND');
    console.log('PT found:', pt ? `${pt.serviceName} - ₱${pt.price}` : 'NOT FOUND');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkHematologyServices();