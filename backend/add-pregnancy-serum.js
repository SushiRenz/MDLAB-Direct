const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');

const mongoURI = 'mongodb://localhost:27017/MDLAB_DIRECT';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');

  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found');
      process.exit(1);
    }

    // Check if Pregnancy Test (Serum) exists
    const pregnancySerum = await Service.findOne({ serviceName: 'Pregnancy Test (Serum)' });
    
    if (!pregnancySerum) {
      // Create it
      await Service.create({
        serviceName: 'Pregnancy Test (Serum)',
        description: 'Quantitative blood pregnancy test (Beta hCG) for accurate pregnancy detection.',
        category: 'clinical_microscopy',
        price: 350.00,
        duration: '1-2 hours',
        sampleType: 'Blood (Serum tube)',
        preparationInstructions: 'No special preparation required.',
        isActive: true,
        gender: 'female',
        methodology: 'ELISA / Immunoassay',
        tags: ['pregnancy', 'serum', 'beta hCG', 'blood test'],
        availability: '24_7',
        createdBy: adminUser._id,
        lastModifiedBy: adminUser._id
      });
      console.log('✅ Created "Pregnancy Test (Serum)"');
    } else {
      console.log('✅ "Pregnancy Test (Serum)" already exists');
    }

    // Verify both pregnancy tests
    const pregnancyTests = await Service.find({ 
      serviceName: { $in: ['Pregnancy Test (Urine)', 'Pregnancy Test (Serum)'] },
      isActive: true
    });

    console.log('\n📋 Pregnancy Tests in Clinical Microscopy:');
    pregnancyTests.forEach(test => {
      console.log(`   - ${test.serviceName} - ₱${test.price.toFixed(2)} (${test.category})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
