const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixJasyResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find jasy user
    const jasyUser = await User.findOne({ email: 'jasy@gmail.com' });
    if (!jasyUser) {
      console.log('❌ Jasy user not found');
      return;
    }
    
    console.log(`👤 Found Jasy: ${jasyUser.firstName} ${jasyUser.lastName} (ID: ${jasyUser._id})`);
    
    // Find test results that should belong to Jasy
    const resultsToFix = await TestResult.find({
      patient: 'jasy@gmail.com'
    });
    
    console.log(`\n🔧 Found ${resultsToFix.length} test results to fix:`);
    
    for (let i = 0; i < resultsToFix.length; i++) {
      const result = resultsToFix[i];
      console.log(`   ${i + 1}. Sample ${result.sampleId} - Current patient: "${result.patient}" -> Fixing to ObjectId`);
      
      // Update the patient field to the correct ObjectId
      result.patient = jasyUser._id;
      await result.save();
      
      console.log(`      ✅ Fixed!`);
    }
    
    console.log('\n✅ All jasy results fixed!');
    
    // Verify the fix
    const verifyResults = await TestResult.find({
      patient: jasyUser._id
    }).sort({ createdAt: -1 });
    
    console.log(`\n🔍 Verification: Found ${verifyResults.length} results for Jasy after fix:`);
    verifyResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixJasyResults();