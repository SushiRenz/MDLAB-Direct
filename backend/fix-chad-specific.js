const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixChadSpecificResult() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find chad user
    const chadUser = await User.findById('68f905192596d6d3ee7440a6');
    console.log(`👤 Found Chad: ${chadUser.firstName} ${chadUser.lastName} (ID: ${chadUser._id})`);
    
    // Find test results that should belong to Chad
    const resultsToFix = await TestResult.find({
      patient: 'chad@gmail.com'
    });
    
    console.log(`\n🔧 Found ${resultsToFix.length} test results to fix:`);
    
    for (let i = 0; i < resultsToFix.length; i++) {
      const result = resultsToFix[i];
      console.log(`   ${i + 1}. Sample ${result.sampleId} - Current patient: "${result.patient}" -> Fixing to ObjectId`);
      
      // Update the patient field to the correct ObjectId
      result.patient = chadUser._id;
      await result.save();
      
      console.log(`      ✅ Fixed!`);
    }
    
    console.log('\n✅ All Chad results fixed!');
    
    // Verify the fix
    const verifyResults = await TestResult.find({
      patient: chadUser._id
    }).sort({ createdAt: -1 });
    
    console.log(`\n🔍 Verification: Found ${verifyResults.length} results for Chad after fix:`);
    verifyResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
    });
    
    // Test login and result access
    console.log('\n🔐 Testing Chad login...');
    const testPassword = 'password123';
    const isMatch = await chadUser.comparePassword(testPassword);
    console.log(`   Password test: ${isMatch ? '✅ WORKS' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixChadSpecificResult();