const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function debugSettAmogusAccount() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find sett amogus user
    const settUser = await User.findOne({
      $or: [
        { firstName: /sett/i, lastName: /amogus/i },
        { firstName: /amogus/i },
        { lastName: /sett/i },
        { email: /sett/i },
        { email: /amogus/i }
      ]
    });
    
    if (!settUser) {
      console.log('❌ Sett Amogus user not found, searching all users...');
      
      const allUsers = await User.find({}).select('firstName lastName email _id role');
      console.log(`\n👥 All users in database (${allUsers.length}):`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user._id} - Role: ${user.role}`);
      });
      return;
    }
    
    console.log(`👤 Found Sett Amogus: ${settUser.firstName} ${settUser.lastName}`);
    console.log(`📧 Email: ${settUser.email}`);
    console.log(`🆔 User ID: ${settUser._id}`);
    console.log(`🔑 Password set: ${!!settUser.passwordHash}`);
    console.log(`🟢 Active: ${settUser.isActive}`);
    
    // Check for test results by ObjectId
    const resultsByObjectId = await TestResult.find({
      patient: settUser._id
    });
    console.log(`\n🔍 Test results by ObjectId (${settUser._id}): ${resultsByObjectId.length}`);
    
    // Check for test results by email
    const resultsByEmail = await TestResult.find({
      patient: settUser.email
    });
    console.log(`🔍 Test results by email (${settUser.email}): ${resultsByEmail.length}`);
    
    // Check for test results by name patterns
    const resultsByName = await TestResult.find({
      $or: [
        { patient: `${settUser.firstName} ${settUser.lastName}` },
        { patient: /sett/i },
        { patient: /amogus/i }
      ]
    });
    console.log(`🔍 Test results by name patterns: ${resultsByName.length}`);
    
    // Show any results found
    const allResults = [...resultsByObjectId, ...resultsByEmail, ...resultsByName];
    if (allResults.length > 0) {
      console.log('\n📋 Found test results:');
      allResults.forEach((result, index) => {
        console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
        console.log(`      Patient: "${result.patient}" (${typeof result.patient})`);
        console.log(`      Status: ${result.status}`);
        console.log(`      Created: ${result.createdAt}`);
        console.log('      ---');
      });
    }
    
    // Check most recent test results to see if any new ones were created
    const recentResults = await TestResult.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`\n📋 Most recent 5 test results in database:`);
    recentResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
      console.log(`      Patient: "${result.patient}" (${typeof result.patient})`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Created: ${result.createdAt}`);
      console.log('      ---');
    });
    
    // Test the API endpoint directly
    if (settUser) {
      console.log(`\n🔍 Testing API query for user ${settUser._id}:`);
      
      const apiResults = await TestResult.find({
        $or: [
          { patient: settUser._id },
          { patient: new mongoose.Types.ObjectId(settUser._id) }
        ],
        status: 'released'
      }).sort({ releasedDate: -1 });
      
      console.log(`   API query result: ${apiResults.length} released results`);
      if (apiResults.length > 0) {
        apiResults.forEach((result, index) => {
          console.log(`     ${index + 1}. ${result.sampleId} - Status: ${result.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugSettAmogusAccount();