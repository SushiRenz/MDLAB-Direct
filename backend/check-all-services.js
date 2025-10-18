const mongoose = require('mongoose');
const Service = require('./models/Service');

// Check all available services
const checkServices = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('🔍 Checking all available services...\n');
    
    const services = await Service.find({ isActive: true })
      .select('serviceName category price')
      .sort({ category: 1, serviceName: 1 });
    
    // Group by category
    const servicesByCategory = {};
    services.forEach(service => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });
    
    console.log('📋 All Available Services by Category:\n');
    
    Object.keys(servicesByCategory).forEach(category => {
      console.log(`🏷️  ${category.toUpperCase().replace(/_/g, ' ')} (${servicesByCategory[category].length} services):`);
      servicesByCategory[category].forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.serviceName} - ₱${service.price}`);
      });
      console.log('');
    });
    
    console.log(`📊 Total Active Services: ${services.length}`);
    
    // Check specifically for coagulation tests
    const coagulationTests = services.filter(s => 
      s.serviceName.toLowerCase().includes('aptt') || 
      s.serviceName.toLowerCase().includes('prothrombin')
    );
    
    console.log(`\n🧪 Coagulation Tests Available: ${coagulationTests.length}`);
    coagulationTests.forEach(test => {
      console.log(`   ✅ ${test.serviceName} - ₱${test.price}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkServices();