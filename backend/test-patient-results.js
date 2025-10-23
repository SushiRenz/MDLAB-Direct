const axios = require('axios');

// Test patient tokens (from the database debug)
const testPatients = [
  {
    name: 'umbra ramos',
    id: '68e5d1ed9f87ac1494450379',
    // You'll need to get a valid token for this user by logging in
  }
];

const testPatientResults = async () => {
  console.log('🧪 Testing Patient Result Fetching...\n');
  
  try {
    // First, let's check what released results exist for account patients
    console.log('1. Checking released results for account patients in database...');
    
    const mongoose = require('mongoose');
    const TestResult = require('./models/TestResult');
    const User = require('./models/User');
    const Service = require('./models/Service'); // Add this import
    
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    
    // Find all patients
    const patients = await User.find({ role: 'patient' }).select('_id firstName lastName email');
    console.log(`Found ${patients.length} patients`);
    
    // Check released results for each patient
    for (const patient of patients.slice(0, 5)) { // Check first 5 patients
      const results = await TestResult.find({
        $or: [
          { patient: patient._id },
          { patient: new mongoose.Types.ObjectId(patient._id) }
        ],
        status: 'released'
      })
      .populate('patient', 'firstName lastName email')
      .populate('service', 'serviceName');
      
      console.log(`   ${patient.firstName} ${patient.lastName}: ${results.length} released results`);
      
      if (results.length > 0) {
        results.forEach(result => {
          const patientName = result.patient ? 
            `${result.patient.firstName} ${result.patient.lastName}` : 
            'Unknown Patient';
          console.log(`     - ${result.testType || result.service?.serviceName} (${patientName})`);
        });
      }
    }
    
    console.log('\n✅ Database check complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

testPatientResults();