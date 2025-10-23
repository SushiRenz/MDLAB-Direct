const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Service = require('./models/Service');

const diagnosePatientLinking = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('🔍 Diagnosing Patient Linking Issues...\n');
    
    // 1. Check a specific released result that should have patient data
    const releasedResults = await TestResult.find({ status: 'released' })
      .populate('patient', 'firstName lastName email')
      .limit(5);
    
    console.log('1. Sample released results with patient data:');
    for (const result of releasedResults) {
      console.log(`   Result ID: ${result._id}`);
      console.log(`   Patient field: ${JSON.stringify(result.patient)}`);
      console.log(`   Patient type: ${typeof result.patient}`);
      console.log(`   IsWalkIn: ${result.isWalkInPatient}`);
      console.log(`   Test Type: ${result.testType}`);
      console.log('   ---');
    }
    
    // 2. Check what the patient field actually contains for account patients
    console.log('\n2. Raw patient field analysis:');
    const resultsRaw = await TestResult.find({ 
      status: 'released',
      isWalkInPatient: { $ne: true } // Not walk-in patients
    }).limit(5);
    
    for (const result of resultsRaw) {
      console.log(`   Result ID: ${result._id}`);
      console.log(`   Raw patient field: ${result.patient}`);
      console.log(`   Patient type: ${typeof result.patient}`);
      console.log(`   Patient toString: ${result.patient?.toString()}`);
      
      // Try to find the actual user
      if (result.patient) {
        try {
          const user = await User.findById(result.patient);
          console.log(`   Found user: ${user ? `${user.firstName} ${user.lastName}` : 'NOT FOUND'}`);
        } catch (error) {
          console.log(`   Error finding user: ${error.message}`);
        }
      }
      console.log('   ---');
    }
    
    // 3. Check specific patient ID from our earlier debug
    console.log('\n3. Checking specific patient ID 68e5d1ed9f87ac1494450379:');
    const specificUser = await User.findById('68e5d1ed9f87ac1494450379');
    if (specificUser) {
      console.log(`   User found: ${specificUser.firstName} ${specificUser.lastName} (${specificUser.email})`);
      
      // Find results for this specific user
      const userResults = await TestResult.find({
        patient: '68e5d1ed9f87ac1494450379',
        status: 'released'
      });
      console.log(`   Released results for this user: ${userResults.length}`);
    } else {
      console.log('   User NOT FOUND');
    }
    
    console.log('\n✅ Diagnosis complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Diagnosis error:', error);
    process.exit(1);
  }
};

diagnosePatientLinking();