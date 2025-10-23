const mongoose = require('mongoose');
const User = require('./models/User');
const TestResult = require('./models/TestResult');

async function fixChadResults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find chad user
    const chadUser = await User.findById('68f905192596d6d3ee7440a6');
    if (!chadUser) {
      console.log('❌ Chad user not found by ID, searching by name...');
      
      // Try to find by name pattern
      const users = await User.find({
        $or: [
          { firstName: /chad/i },
          { lastName: /chad/i },
          { email: /chad/i }
        ]
      });
      
      console.log(`Found ${users.length} users matching 'chad':`);
      users.forEach(user => {
        console.log(`   ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user._id}`);
      });
      
      if (users.length > 0) {
        // Use the first match
        const chadUser = users[0];
        console.log(`\n🎯 Using: ${chadUser.firstName} ${chadUser.lastName} (ID: ${chadUser._id})`);
        
        // Set password
        chadUser.passwordHash = 'password123';
        await chadUser.save();
        console.log('✅ Password set for Chad');
        
        // Find test results with chad email
        const resultsToFix = await TestResult.find({
          $or: [
            { patient: chadUser.email },
            { patient: `${chadUser.firstName} ${chadUser.lastName}` },
            { patient: /chad/i }
          ]
        });
        
        console.log(`\n🔧 Found ${resultsToFix.length} test results to fix:`);
        
        for (let i = 0; i < resultsToFix.length; i++) {
          const result = resultsToFix[i];
          console.log(`   ${i + 1}. Sample ${result.sampleId} - Current patient: "${result.patient}"`);
          
          result.patient = chadUser._id;
          await result.save();
          console.log(`      ✅ Fixed to ObjectId: ${chadUser._id}`);
        }
        
        // Verify the fix
        const verifyResults = await TestResult.find({
          patient: chadUser._id
        }).sort({ createdAt: -1 });
        
        console.log(`\n🔍 Verification: Found ${verifyResults.length} results for Chad after fix:`);
        verifyResults.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.sampleId} - Status: ${result.status} - Created: ${result.createdAt}`);
        });
      }
      
      return;
    }
    
    console.log(`👤 Found Chad: ${chadUser.firstName} ${chadUser.lastName} (ID: ${chadUser._id})`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixChadResults();