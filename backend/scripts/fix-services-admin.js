const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/mdlab-direct')
  .then(() => console.log('✅ Connected to database'))
  .catch(err => console.error('❌ Database connection error:', err));

async function fixServicesWithProperAdmin() {
  try {
    // Find or create an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('🔄 Creating admin user...');
      adminUser = new User({
        email: 'admin@mdlab.com',
        password: 'admin123', // This will be hashed
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Created admin user:', adminUser.email);
    } else {
      console.log('✅ Found existing admin user:', adminUser.email);
    }

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️ Cleared all existing services');

    // Create services with proper admin user
    const servicesData = [
      {
        serviceId: 'SRV-2025-563346', // Match the original ID
        serviceName: 'X-Ray Chest (PA)',
        description: 'Chest X-ray to examine the heart, lungs, and chest wall structure',
        price: 800,
        category: 'imaging',
        duration: '15 minutes',
        sampleType: 'Imaging Study',
        preparationInstructions: 'Remove any jewelry or metal objects from chest area',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        serviceId: 'SRV-2025-CBC001',
        serviceName: 'Complete Blood Count (CBC)',
        description: 'Complete blood count to check overall health and detect disorders',
        price: 350,
        category: 'blood_tests',
        duration: '10 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'No special preparation required',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        serviceId: 'SRV-2025-FBS001',
        serviceName: 'Fasting Blood Sugar (FBS)',
        description: 'Test to check blood glucose levels after fasting',
        price: 150,
        category: 'blood_tests',
        duration: '5 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'Fast for 8-12 hours before the test',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        serviceId: 'SRV-2025-LIP001',
        serviceName: 'Lipid Profile',
        description: 'Test to measure cholesterol and triglyceride levels',
        price: 450,
        category: 'blood_tests',
        duration: '10 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'Fast for 9-12 hours before the test',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        serviceId: 'SRV-2025-URI001',
        serviceName: 'Urinalysis (Complete Urine Examination)',
        description: 'Comprehensive urine test to detect urinary tract infections, kidney disease, and other conditions',
        price: 200,
        category: 'urine_tests',
        duration: '5 minutes',
        sampleType: 'Urine',
        preparationInstructions: 'Collect midstream urine sample in sterile container',
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    // Create all services
    for (const serviceData of servicesData) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`✅ Created service: ${serviceData.serviceName}`);
    }

    // Verify creation
    const allServices = await Service.find({}).populate('createdBy', 'email firstName lastName');
    console.log(`\n📋 Total services created: ${allServices.length}`);
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.serviceName} - ₱${service.price} (Created by: ${service.createdBy?.email || 'NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error fixing services:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

fixServicesWithProperAdmin();