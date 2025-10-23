const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function debugChadTestResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find chad user
    const chadUser = await User.findById('68f905192596d6d3ee7440a6');
    console.log(`👤 Chad User: ${chadUser.firstName} ${chadUser.lastName}`);
    console.log(`📧 Email: ${chadUser.email}`);
    console.log(`🔑 Password set: ${!!chadUser.passwordHash}`);
    
    // Check for test results by ObjectId
    const resultsByObjectId = await TestResult.find({
      patient: chadUser._id
    });
    console.log(`\n🔍 Test results by ObjectId (${chadUser._id}): ${resultsByObjectId.length}`);
    
    // Check for test results by email
    const resultsByEmail = await TestResult.find({
      patient: chadUser.email
    });
    console.log(`🔍 Test results by email (${chadUser.email}): ${resultsByEmail.length}`);
    
    // Check for test results by name
    const resultsByName = await TestResult.find({
      patient: `${chadUser.firstName} ${chadUser.lastName}`
    });
    console.log(`🔍 Test results by name (${chadUser.firstName} ${chadUser.lastName}): ${resultsByName.length}`);
    
    // Check for test results with any chad pattern
    const resultsByPattern = await TestResult.find({
      patient: /chad/i
    });
    console.log(`🔍 Test results by pattern (/chad/i): ${resultsByPattern.length}`);
    
    if (resultsByPattern.length > 0) {
      console.log('\n📋 Found results with chad pattern:');
      resultsByPattern.forEach((result, index) => {
        console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
        console.log(`      Patient: "${result.patient}" (${typeof result.patient})`);
        console.log(`      Status: ${result.status}`);
        console.log(`      Created: ${result.createdAt}`);
        console.log('      ---');
      });
    }
    
    // Check most recent test results to see what's being created
    const recentResults = await TestResult.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`\n📋 Most recent 10 test results:`);
    recentResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Sample: ${result.sampleId}`);
      console.log(`      Patient: "${result.patient}" (${typeof result.patient})`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Created: ${result.createdAt}`);
      console.log('      ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugChadTestResults();