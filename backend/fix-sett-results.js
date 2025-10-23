const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixSettTestResult() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find sett user
    const settUser = await User.findById('68f908c8b5239165aa91b2e2');
    console.log(`👤 Found Sett: ${settUser.firstName} ${settUser.lastName} (ID: ${settUser._id})`);
    
    // Find test results that should belong to Sett
    const resultsToFix = await TestResult.find({
      patient: 'sett@gmail.com'
    });
    
    console.log(`\n🔧 Found ${resultsToFix.length} test results to fix:`);
    
    for (let i = 0; i < resultsToFix.length; i++) {
      const result = resultsToFix[i];
      console.log(`   ${i + 1}. Sample ${result.sampleId} - Current patient: "${result.patient}" -> Fixing to ObjectId`);
      
      // Update the patient field to the correct ObjectId
      result.patient = settUser._id;
      await result.save();
      
      console.log(`      ✅ Fixed!`);
    }
    
    console.log('\n✅ All Sett results fixed!');
    
    // Verify the fix
    const verifyResults = await TestResult.find({
      patient: settUser._id,
      status: 'released'
    }).sort({ createdAt: -1 });
    
    console.log(`\n🔍 Verification: Found ${verifyResults.length} RELEASED results for Sett after fix:`);
    verifyResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixSettTestResult();