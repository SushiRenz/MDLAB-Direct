const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixAllTestResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find all users to create a mapping
    const allUsers = await User.find({ role: 'patient' });
    const userMapping = {};
    
    console.log(`👥 Found ${allUsers.length} patients:`);
    allUsers.forEach(user => {
      userMapping[user.email] = user._id;
      userMapping[`${user.firstName} ${user.lastName}`] = user._id;
      console.log(`   ${user.firstName} ${user.lastName} (${user.email}) -> ${user._id}`);
    });
    
    // Find all test results with string patient fields
    const resultsToFix = await TestResult.find({
      patient: { $type: "string" }
    });
    
    console.log(`\n🔧 Found ${resultsToFix.length} test results with string patient fields:`);
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (let i = 0; i < resultsToFix.length; i++) {
      const result = resultsToFix[i];
      const patientString = result.patient;
      
      console.log(`\n   ${i + 1}. Sample ${result.sampleId}`);
      console.log(`      Current patient: "${patientString}" (${typeof patientString})`);
      
      // Try to find matching user
      const matchedUserId = userMapping[patientString];
      
      if (matchedUserId) {
        console.log(`      ✅ Found matching user: ${matchedUserId}`);
        result.patient = matchedUserId;
        await result.save();
        fixedCount++;
        console.log(`      ✅ Updated successfully!`);
      } else {
        console.log(`      ❌ No matching user found for "${patientString}"`);
        notFoundCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} results`);
    console.log(`   ❌ Not found: ${notFoundCount} results`);
    
    // Verify the fixes
    console.log(`\n🔍 Verification - checking all patients' results:`);
    for (const user of allUsers) {
      const userResults = await TestResult.find({
        patient: user._id
      }).sort({ createdAt: -1 });
      
      if (userResults.length > 0) {
        console.log(`\n   👤 ${user.firstName} ${user.lastName} (${user.email}):`);
        console.log(`      Found ${userResults.length} results:`);
        userResults.forEach((result, index) => {
          console.log(`         ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAllTestResults();