const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check existing hematology services and add coagulation tests
const manageCoagulationTests = async () => {
  try {
    console.log('🔍 Checking existing hematology services...');

    // Check if APTT and PT already exist
    const existingAPTT = await Service.findOne({ serviceName: { $regex: /APTT|Activated Partial Thromboplastin Time/i } });
    const existingPT = await Service.findOne({ serviceName: { $regex: /^PT|Prothrombin Time/i } });

    console.log('🔍 APTT exists:', existingAPTT ? 'Yes' : 'No');
    console.log('🔍 PT exists:', existingPT ? 'Yes' : 'No');

    if (!existingAPTT) {
      console.log('➕ Adding APTT test...');
      const apttTest = new Service({
        serviceName: 'APTT (Activated Partial Thromboplastin Time)',
        description: 'Measures the time it takes blood to clot. Used to monitor heparin therapy and diagnose bleeding disorders affecting the intrinsic coagulation pathway.',
        category: 'hematology',
        price: 250.00,
        duration: '2-4 hours',
        sampleType: 'Citrated plasma (Blue top tube)',
        preparationInstructions: 'No special preparation required. Patient should not be on anticoagulant therapy unless specifically being monitored.',
        isActive: true,
        isPopular: false,
        isPackage: false,
        normalRange: {
          general: '25-35 seconds',
          male: '25-35 seconds',
          female: '25-35 seconds'
        },
        methodology: 'Clot-based method using automated coagulation analyzer',
        equipment: 'Automated coagulation analyzer',
        tags: ['coagulation', 'bleeding disorders', 'heparin monitoring', 'intrinsic pathway'],
        availability: '24_7',
        createdBy: new mongoose.Types.ObjectId('670f5e8c123456789abcdef0') // Placeholder ID
      });
      await apttTest.save();
      console.log('✅ APTT test added successfully');
    }

    if (!existingPT) {
      console.log('➕ Adding PT test...');
      const ptTest = new Service({
        serviceName: 'PT (Prothrombin Time)',
        description: 'Measures the time it takes blood to clot. Used to monitor warfarin therapy and assess extrinsic coagulation pathway function.',
        category: 'hematology',
        price: 200.00,
        duration: '2-4 hours',
        sampleType: 'Citrated plasma (Blue top tube)',
        preparationInstructions: 'No special preparation required. Patient should inform lab staff of any anticoagulant medications.',
        isActive: true,
        isPopular: false,
        isPackage: false,
        normalRange: {
          general: '11-15 seconds (INR: 0.8-1.2)',
          male: '11-15 seconds (INR: 0.8-1.2)',
          female: '11-15 seconds (INR: 0.8-1.2)'
        },
        methodology: 'Clot-based method using automated coagulation analyzer',
        equipment: 'Automated coagulation analyzer',
        tags: ['coagulation', 'warfarin monitoring', 'bleeding disorders', 'extrinsic pathway', 'INR'],
        availability: '24_7',
        createdBy: new mongoose.Types.ObjectId('670f5e8c123456789abcdef0') // Placeholder ID
      });
      await ptTest.save();
      console.log('✅ PT test added successfully');
    }

    // List all hematology services
    const hematologyServices = await Service.find({ category: 'hematology', isActive: true })
      .select('serviceName price normalRange')
      .sort({ serviceName: 1 });
    
    console.log('\n🩸 All Hematology Services:');
    hematologyServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.serviceName} - ₱${service.price}`);
      if (service.normalRange && service.normalRange.general) {
        console.log(`      Normal Range: ${service.normalRange.general}`);
      }
    });

    console.log(`\n📊 Total Hematology Services: ${hematologyServices.length}`);
    
  } catch (error) {
    console.error('❌ Error managing coagulation tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  manageCoagulationTests().then(() => {
    process.exit(0);
  });
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});