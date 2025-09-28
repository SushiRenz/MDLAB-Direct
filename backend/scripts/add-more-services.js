const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Additional services for a complete lab catalog
const additionalServices = [
  {
    serviceName: 'Urinalysis (Complete Urine Examination)',
    description: 'Comprehensive urine test to detect urinary tract infections, kidney disease, and other conditions.',
    category: 'urine_tests',
    price: 200,
    duration: '20 minutes',
    sampleType: 'Urine (Mid-stream clean catch)',
    preparationInstructions: 'Collect first morning urine sample in sterile container. Clean genital area before collection.',
    isActive: true,
    isPopular: true,
    packageItems: ['Physical Examination', 'Chemical Examination', 'Microscopic Examination'],
    normalRange: {
      general: 'Specific Gravity: 1.005-1.030, pH: 4.6-8.0, Protein: Negative, Glucose: Negative'
    },
    methodology: 'Dipstick and Microscopy',
    equipment: 'Sysmex UF-1000i',
    tags: ['urine', 'infection', 'kidney', 'uti'],
    availability: '24_7'
  },
  {
    serviceName: 'X-Ray Chest (PA)',
    description: 'Chest X-ray to examine the heart, lungs, and chest wall structures.',
    category: 'imaging',
    price: 800,
    discountPrice: 700,
    duration: '15 minutes',
    sampleType: 'Imaging Study',
    preparationInstructions: 'Remove all jewelry and metal objects from chest area. Wear hospital gown.',
    isActive: true,
    normalRange: {
      general: 'Normal heart and lung fields, clear chest structures'
    },
    methodology: 'Digital Radiography',
    equipment: 'Digital X-ray Machine',
    tags: ['chest', 'lungs', 'heart', 'imaging'],
    availability: '24_7'
  },
  {
    serviceName: 'ECG/EKG (Electrocardiogram)',
    description: 'Test to check heart rhythm and electrical activity.',
    category: 'special_tests',
    price: 500,
    duration: '10 minutes',
    sampleType: 'Electrical Recording',
    preparationInstructions: 'No special preparation required. Avoid lotions on chest area.',
    isActive: true,
    normalRange: {
      general: 'Normal sinus rhythm, heart rate 60-100 bpm'
    },
    methodology: '12-lead ECG',
    equipment: 'Digital ECG Machine',
    tags: ['heart', 'rhythm', 'cardiac'],
    availability: '24_7'
  },
  {
    serviceName: 'Stool Examination (Fecalysis)',
    description: 'Microscopic examination of stool for parasites, bacteria, and other abnormalities.',
    category: 'pathology',
    price: 180,
    duration: '30 minutes',
    sampleType: 'Stool sample',
    preparationInstructions: 'Collect fresh stool sample in sterile container. Avoid contamination with urine.',
    isActive: true,
    normalRange: {
      general: 'No parasites, normal flora, formed consistency'
    },
    methodology: 'Microscopic Examination',
    equipment: 'Light Microscope',
    tags: ['stool', 'parasites', 'infection'],
    availability: '24_7'
  },
  {
    serviceName: 'Pregnancy Test (Beta hCG)',
    description: 'Blood test to detect pregnancy hormone.',
    category: 'blood_tests',
    price: 250,
    duration: '15 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No fasting required. Can be done at any time.',
    isActive: true,
    isPopular: true,
    normalRange: {
      female: 'Non-pregnant: <5 mIU/mL, Pregnant: varies by gestational age'
    },
    methodology: 'Chemiluminescent Immunoassay',
    equipment: 'Cobas e411',
    tags: ['pregnancy', 'hormone', 'women'],
    availability: '24_7'
  }
];

// Add services to database
const addServices = async () => {
  try {
    await connectDB();

    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('📋 Current services in database:');
    const existingServices = await Service.find({});
    existingServices.forEach(service => {
      console.log(`   - ${service.serviceName} (₱${service.price}) - ${service.isActive ? 'Active' : 'Inactive'}`);
    });
    console.log(`📊 Total existing services: ${existingServices.length}\n`);

    // Add createdBy field to all services
    const servicesWithCreator = additionalServices.map(service => ({
      ...service,
      createdBy: adminUser._id,
      lastModifiedBy: adminUser._id
    }));

    // Insert new services
    const insertedServices = await Service.insertMany(servicesWithCreator);
    console.log(`✅ Successfully added ${insertedServices.length} new services:`);
    
    insertedServices.forEach(service => {
      console.log(`   + ${service.serviceName} (₱${service.price})`);
    });

    // Show final count
    const finalCount = await Service.countDocuments({});
    const activeCount = await Service.countDocuments({ isActive: true });
    
    console.log(`\n📈 Final statistics:`);
    console.log(`   Total Services: ${finalCount}`);
    console.log(`   Active Services: ${activeCount}`);
    console.log(`   Categories: ${new Set(await Service.distinct('category')).size}`);
    
    console.log('\n🎉 Services successfully added to database!');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Some services already exist (duplicate key), but that\'s okay.');
      
      // Show final count even with duplicates
      const finalCount = await Service.countDocuments({});
      const activeCount = await Service.countDocuments({ isActive: true });
      
      console.log(`📈 Current database statistics:`);
      console.log(`   Total Services: ${finalCount}`);
      console.log(`   Active Services: ${activeCount}`);
    } else {
      console.error('❌ Error adding services:', error);
    }
  } finally {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the script
if (require.main === module) {
  addServices();
}

module.exports = { addServices, additionalServices };