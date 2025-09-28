const mongoose = require('mongoose');
const Service = require('../models/Service');

// Connect to database
mongoose.connect('mongodb://localhost:27017/mdlab-direct')
  .then(() => console.log('✅ Connected to database'))
  .catch(err => console.error('❌ Database connection error:', err));

async function syncServices() {
  try {
    // Clear existing services first
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services');

    // We need a dummy user ID for createdBy field - let's find one from existing users
    const User = require('../models/User');
    let createdBy;
    const firstUser = await User.findOne({});
    if (firstUser) {
      createdBy = firstUser._id;
      console.log('📋 Using user ID for createdBy:', createdBy);
    } else {
      // Create a dummy ObjectId if no users exist
      createdBy = new mongoose.Types.ObjectId();
      console.log('📋 Using dummy ObjectId for createdBy:', createdBy);
    }

    // Add the service that matches the owner panel: "X Ray Chest (PA)" - ₱800
    const xrayService = new Service({
      serviceId: 'SRV-2025-563346', // Match the ID shown in owner panel
      serviceName: 'X Ray Chest (PA)',
      description: 'Chest X-ray to examine the heart, lungs, and chest wall structure',
      price: 800,
      category: 'imaging', // Valid enum value
      duration: '15 minutes',
      sampleType: 'None required', // Required field
      preparationInstructions: 'Remove any jewelry or metal objects from chest area',
      isActive: true,
      createdBy: createdBy
    });

    await xrayService.save();
    console.log('✅ Added X Ray Chest (PA) service');

    // Let's also add a few common lab services that should be available
    const commonServices = [
      {
        serviceId: 'SRV-2025-CBC001',
        serviceName: 'Complete Blood Count (CBC)',
        description: 'Complete blood count to check overall health and detect disorders',
        price: 350,
        category: 'blood_tests', // Valid enum value
        duration: '10 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'No special preparation required',
        isActive: true,
        createdBy: createdBy
      },
      {
        serviceId: 'SRV-2025-FBS001',
        serviceName: 'Fasting Blood Sugar (FBS)',
        description: 'Test to check blood glucose levels after fasting',
        price: 150,
        category: 'blood_tests', // Valid enum value
        duration: '5 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'Fast for 8-12 hours before the test',
        isActive: true,
        createdBy: createdBy
      },
      {
        serviceId: 'SRV-2025-LIP001',
        serviceName: 'Lipid Profile',
        description: 'Test to measure cholesterol and triglyceride levels',
        price: 450,
        category: 'blood_tests', // Valid enum value
        duration: '10 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'Fast for 9-12 hours before the test',
        isActive: true,
        createdBy: createdBy
      },
      {
        serviceId: 'SRV-2025-URI001',
        serviceName: 'Urinalysis (Complete Urine Examination)',
        description: 'Comprehensive urine test to detect urinary tract infections, kidney disease, and other conditions',
        price: 200,
        category: 'urine_tests', // Valid enum value
        duration: '5 minutes',
        sampleType: 'Urine',
        preparationInstructions: 'Collect midstream urine sample in sterile container',
        isActive: true,
        createdBy: createdBy
      }
    ];

    for (const serviceData of commonServices) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`✅ Added ${serviceData.serviceName} service`);
    }

    // Verify what we have
    const allServices = await Service.find({});
    console.log(`\n📋 Total services in database: ${allServices.length}`);
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.serviceName} - ₱${service.price} (${service.status})`);
    });

  } catch (error) {
    console.error('❌ Error syncing services:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

syncServices();