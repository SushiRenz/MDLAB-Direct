const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function debugTestResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find Pen Penny user
    const penUser = await User.findOne({
      $or: [
        { firstName: { $regex: /pen/i } },
        { lastName: { $regex: /penny/i } },
        { email: { $regex: /pen/i } }
      ]
    });
    
    if (penUser) {
      console.log('👤 Found Pen Penny user:');
      console.log(`   Name: ${penUser.firstName} ${penUser.lastName}`);
      console.log(`   Email: ${penUser.email}`);
      console.log(`   ID: ${penUser._id}`);
      console.log(`   Role: ${penUser.role}`);
      console.log('   ---');
      
      // Find test results for this patient
      const testResults = await TestResult.find({
        $or: [
          { patient: penUser._id },
          { patient: penUser._id.toString() },
          { patientId: penUser._id },
          { patientName: { $regex: new RegExp(penUser.firstName, 'i') } },
          { patientName: { $regex: new RegExp(penUser.lastName, 'i') } }
        ]
      }).sort({ createdAt: -1 }).limit(10);
      
      // Also check what patient IDs exist in recent test results
      console.log(`\n🔍 Checking if any results have patient ID: ${penUser._id}`);
      const matchingResults = await TestResult.find({
        patient: { $in: [penUser._id, penUser._id.toString()] }
      });
      console.log(`   Found ${matchingResults.length} results with matching patient ID`);
      
      console.log(`🧪 Test Results for ${penUser.firstName} ${penUser.lastName}:`);
      console.log(`   Found ${testResults.length} results`);
      
      if (testResults.length > 0) {
        testResults.forEach((result, index) => {
          console.log(`   ${index + 1}. Sample ID: ${result.sampleId || 'N/A'}`);
          console.log(`      Test Type: ${result.testType || result.serviceName || 'N/A'}`);
          console.log(`      Status: ${result.status}`);
          console.log(`      Patient ID: ${result.patient || result.patientId}`);
          console.log(`      Patient Name: ${result.patientName || 'N/A'}`);
          console.log(`      Created: ${result.createdAt}`);
          console.log(`      Is Released: ${result.isReleased}`);
          console.log(`      ---`);
        });
      } else {
        console.log('   ❌ No test results found');
      }
      
      // Also check all recent test results to see what's in the database
      console.log('\n📋 All Recent Test Results (last 5):');
      const allResults = await TestResult.find({}).sort({ createdAt: -1 }).limit(5);
      allResults.forEach((result, index) => {
        console.log(`   ${index + 1}. Sample: ${result.sampleId || 'N/A'}`);
        console.log(`      Patient Field: ${result.patient} (Type: ${typeof result.patient})`);
        console.log(`      Patient Name: ${result.patientName || 'N/A'}`);
        console.log(`      Status: ${result.status}`);
        console.log(`      Created: ${result.createdAt}`);
        console.log(`      ---`);
      });
      
    } else {
      console.log('❌ Pen Penny user not found');
      
      // Show all users with "pen" in name
      console.log('\n📋 Users with "pen" or "penny" in name:');
      const similarUsers = await User.find({
        $or: [
          { firstName: { $regex: /pen/i } },
          { lastName: { $regex: /pen/i } },
          { email: { $regex: /pen/i } }
        ]
      });
      
      similarUsers.forEach(user => {
        console.log(`   ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugTestResults();