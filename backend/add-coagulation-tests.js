const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mdlab-direct', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add coagulation tests (APTT and PT) to hematology category
const addCoagulationTests = async () => {
  try {
    console.log('🔬 Adding coagulation tests to hematology category...');

    // APTT Test
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
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001') // Default system user
    });

    // PT Test
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
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001') // Default system user
    });

    // Save the tests to the database
    const savedAPTT = await apttTest.save();
    const savedPT = await ptTest.save();

    console.log('✅ Successfully added coagulation tests:');
    console.log(`   📋 APTT Test - ID: ${savedAPTT._id}, Service ID: ${savedAPTT.serviceId}`);
    console.log(`   📋 PT Test - ID: ${savedPT._id}, Service ID: ${savedPT.serviceId}`);

    // List all hematology services
    const hematologyServices = await Service.find({ category: 'hematology', isActive: true }).select('serviceName price');
    console.log('\n🩸 All Hematology Services:');
    hematologyServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.serviceName} - ₱${service.price}`);
    });

    console.log('\n🎉 Coagulation tests added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding coagulation tests:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await addCoagulationTests();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script execution error:', error);
  process.exit(1);
});