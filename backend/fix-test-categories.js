const mongoose = require('mongoose');
const Service = require('./models/Service');

const mongoURI = 'mongodb://localhost:27017/MDLAB_DIRECT';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');

  try {
    console.log('\n🔧 Fixing test categorizations...\n');

    // Find an admin user for createdBy field
    const User = require('./models/User');
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found');
      process.exit(1);
    }

    // 1. Remove duplicate "Serum Pregnancy Test" from Clinical Chemistry
    const deleted = await Service.deleteOne({ 
      serviceName: 'Serum Pregnancy Test',
      category: 'clinical_chemistry'
    });
    console.log(`${deleted.deletedCount > 0 ? '✅' : 'ℹ️'} Removed duplicate "Serum Pregnancy Test" from Clinical Chemistry`);

    // 2. Move Pregnancy Test (Serum) to Clinical Microscopy (if it's in wrong category)
    const pregnancySerum = await Service.updateOne(
      { serviceName: 'Pregnancy Test (Serum)' },
      { $set: { category: 'clinical_microscopy' } }
    );
    console.log(`${pregnancySerum.modifiedCount > 0 ? '✅' : 'ℹ️'} Moved "Pregnancy Test (Serum)" to Clinical Microscopy`);

    // 3. Move Blood Typing from Hematology to Serology/Immunology
    const bloodTyping = await Service.updateOne(
      { serviceName: 'Blood Typing (ABO Rh)', category: 'hematology' },
      { 
        $set: { 
          category: 'serology_immunology',
          description: 'Determination of ABO blood group and Rh factor using immunological methods.',
          methodology: 'Agglutination Method (Immunohematology)'
        } 
      }
    );
    console.log(`${bloodTyping.modifiedCount > 0 ? '✅' : 'ℹ️'} Moved "Blood Typing (ABO Rh)" to Serology/Immunology`);

    // 4. Add PT and APTT to Hematology if they don't exist
    const ptExists = await Service.findOne({ serviceName: 'PT (Prothrombin Time)' });
    if (!ptExists) {
      await Service.create({
        serviceName: 'PT (Prothrombin Time)',
        description: 'Blood clotting test for monitoring anticoagulant therapy.',
        category: 'hematology',
        price: 200.00,
        duration: '2-4 hours',
        sampleType: 'Blood (Sodium citrate tube)',
        preparationInstructions: 'No special preparation required. Patient should inform lab staff of any anticoagulant medications.',
        isActive: true,
        methodology: 'Photo-optical Method',
        tags: ['clotting', 'coagulation', 'warfarin', 'anticoagulant'],
        availability: '24_7',
        createdBy: adminUser._id,
        lastModifiedBy: adminUser._id
      });
      console.log('✅ Added "PT (Prothrombin Time)" to Hematology');
    } else {
      console.log('ℹ️ "PT (Prothrombin Time)" already exists');
    }

    const apttExists = await Service.findOne({ serviceName: 'APTT (Activated Partial Thromboplastin Time)' });
    if (!apttExists) {
      await Service.create({
        serviceName: 'APTT (Activated Partial Thromboplastin Time)',
        description: 'Blood clotting test for monitoring heparin therapy and detecting clotting disorders.',
        category: 'hematology',
        price: 250.00,
        duration: '2-4 hours',
        sampleType: 'Blood (Sodium citrate tube)',
        preparationInstructions: 'No special preparation required. Patient should not be on anticoagulant therapy unless specifically being monitored.',
        isActive: true,
        methodology: 'Photo-optical Method',
        tags: ['clotting', 'coagulation', 'heparin', 'bleeding disorders'],
        availability: '24_7',
        createdBy: adminUser._id,
        lastModifiedBy: adminUser._id
      });
      console.log('✅ Added "APTT (Activated Partial Thromboplastin Time)" to Hematology');
    } else {
      console.log('ℹ️ "APTT (Activated Partial Thromboplastin Time)" already exists');
    }

    console.log('\n📊 Current test distribution by category:\n');
    
    const categories = [
      { key: 'clinical_chemistry', name: 'Clinical Chemistry' },
      { key: 'hematology', name: 'Hematology' },
      { key: 'clinical_microscopy', name: 'Clinical Microscopy' },
      { key: 'serology_immunology', name: 'Serology / Immunology' }
    ];

    for (const cat of categories) {
      const count = await Service.countDocuments({ category: cat.key, isActive: true });
      const tests = await Service.find({ category: cat.key, isActive: true }).select('serviceName');
      console.log(`\n📋 ${cat.name} (${count} tests):`);
      tests.forEach(test => console.log(`   - ${test.serviceName}`));
    }

    console.log('\n✅ Test categorization fixes completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing test categories:', error);
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
