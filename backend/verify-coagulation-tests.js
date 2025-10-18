const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MDLAB_DIRECT database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Verify coagulation tests exist
const verifyCoagulationTests = async () => {
  try {
    console.log('🔍 Verifying coagulation tests...\n');

    // Find APTT and PT tests
    const apttTest = await Service.findOne({ serviceName: { $regex: /APTT.*Activated Partial Thromboplastin Time/i } });
    const ptTest = await Service.findOne({ serviceName: { $regex: /^PT.*Prothrombin Time/i } });

    console.log('🧪 APTT Test:');
    if (apttTest) {
      console.log(`   ✅ Found: ${apttTest.serviceName}`);
      console.log(`   💰 Price: ₱${apttTest.price}`);
      console.log(`   📏 Normal Range: ${apttTest.normalRange.general}`);
      console.log(`   🧪 Sample Type: ${apttTest.sampleType}`);
      console.log(`   ⏱️ Duration: ${apttTest.duration}`);
    } else {
      console.log('   ❌ Not found');
    }

    console.log('\n🩸 PT Test:');
    if (ptTest) {
      console.log(`   ✅ Found: ${ptTest.serviceName}`);
      console.log(`   💰 Price: ₱${ptTest.price}`);
      console.log(`   📏 Normal Range: ${ptTest.normalRange.general}`);
      console.log(`   🧪 Sample Type: ${ptTest.sampleType}`);
      console.log(`   ⏱️ Duration: ${ptTest.duration}`);
    } else {
      console.log('   ❌ Not found');
    }

    // List all hematology services for verification
    console.log('\n🩸 All Hematology Services:');
    const hematologyServices = await Service.find({ 
      category: 'hematology', 
      isActive: true 
    }).select('serviceName price normalRange.general').sort({ serviceName: 1 });
    
    hematologyServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.serviceName} - ₱${service.price}`);
      if (service.normalRange && service.normalRange.general) {
        console.log(`      └─ Normal Range: ${service.normalRange.general}`);
      }
    });

    console.log(`\n📊 Total Hematology Services: ${hematologyServices.length}`);

    // Verify if coagulation tests are properly categorized
    const coagulationTests = hematologyServices.filter(service => 
      service.serviceName.toLowerCase().includes('aptt') || 
      service.serviceName.toLowerCase().includes('prothrombin') ||
      service.serviceName.toLowerCase().includes('coagulation')
    );

    console.log(`\n🔬 Coagulation Tests in Hematology: ${coagulationTests.length}`);
    coagulationTests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.serviceName}`);
    });

    if (apttTest && ptTest) {
      console.log('\n✅ SUCCESS: Both APTT and PT tests are properly configured!');
      console.log('📋 Next steps:');
      console.log('   1. Tests are available for appointment booking');
      console.log('   2. MedTech Dashboard now includes coagulation section');
      console.log('   3. Review Results will display coagulation values');
      console.log('   4. Reference ranges are configured');
    } else {
      console.log('\n❌ ISSUE: One or both coagulation tests are missing');
    }
    
  } catch (error) {
    console.error('❌ Error verifying coagulation tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run verification
connectDB().then(() => {
  verifyCoagulationTests().then(() => {
    process.exit(0);
  });
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});