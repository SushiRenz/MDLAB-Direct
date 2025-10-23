const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixTestResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find Pen Penny user
    const penUser = await User.findOne({ email: 'penny@gmail.com' });
    if (!penUser) {
      console.log('❌ Pen Penny user not found');
      return;
    }
    
    console.log(`👤 Found Pen Penny: ${penUser.firstName} ${penUser.lastName} (ID: ${penUser._id})`);
    
    // Find test results that should belong to Pen Penny
    const resultsToFix = await TestResult.find({
      $or: [
        { patient: 'penny@gmail.com' },
        { patient: 'Pen Penny' },
        { patient: /pen.*penny/i }
      ]
    });
    
    console.log(`\n🔧 Found ${resultsToFix.length} test results to fix:`);
    
    for (let i = 0; i < resultsToFix.length; i++) {
      const result = resultsToFix[i];
      console.log(`   ${i + 1}. Sample ${result.sampleId} - Current patient: "${result.patient}" -> Fixing to ObjectId`);
      
      // Update the patient field to the correct ObjectId
      result.patient = penUser._id;
      await result.save();
      
      console.log(`      ✅ Fixed!`);
    }
    
    console.log('\n✅ All test results fixed!');
    
    // Verify the fix
    const verifyResults = await TestResult.find({
      patient: penUser._id
    }).sort({ createdAt: -1 });
    
    console.log(`\n🔍 Verification: Found ${verifyResults.length} results for Pen Penny after fix:`);
    verifyResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixTestResults();