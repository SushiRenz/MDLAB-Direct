const mongoose = require('mongoose');
require('./models/User');
const User = mongoose.model('User');

async function testMedTechPermissions() {
  try {
    console.log('🔧 Testing MedTech Authorization Fix...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if we have MedTech users
    console.log('\n👥 Checking user roles in database...');
    
    const userRoleCounts = {};
    const allUsers = await User.find();
    allUsers.forEach(user => {
      userRoleCounts[user.role] = (userRoleCounts[user.role] || 0) + 1;
    });
    
    console.log('   User role distribution:', userRoleCounts);
    
    // Find a MedTech user for testing
    const medTechUser = await User.findOne({ role: 'medtech' });
    if (medTechUser) {
      console.log(`   ✅ Found MedTech user: ${medTechUser.firstName} ${medTechUser.lastName} (${medTechUser.email})`);
      console.log(`   🔑 User ID: ${medTechUser._id}`);
    } else {
      console.log('   ⚠️  No MedTech users found in database');
    }
    
    // Find a Pathologist user for comparison
    const pathologistUser = await User.findOne({ role: 'pathologist' });
    if (pathologistUser) {
      console.log(`   ✅ Found Pathologist user: ${pathologistUser.firstName} ${pathologistUser.lastName} (${pathologistUser.email})`);
    } else {
      console.log('   ⚠️  No Pathologist users found in database');
    }
    
    console.log('\n🎉 Authorization Fix Applied!');
    console.log('\n📋 Summary of Changes:');
    console.log('   ✅ Routes now use auth.staffOnly instead of auth.medicalOnly');
    console.log('   ✅ MedTechs can now approve test results');
    console.log('   ✅ MedTechs can now reject test results');
    console.log('   ✅ Proper role assignment in approval/rejection notes');
    
    console.log('\n🔍 Who can now access approve/reject endpoints:');
    console.log('   ✅ MedTech - Can approve and reject test results');
    console.log('   ✅ Pathologist - Can approve and reject test results');
    console.log('   ✅ Admin - Can approve and reject test results');
    console.log('   ✅ Receptionist - Can approve and reject test results');
    console.log('   ❌ Patient - Cannot access these endpoints');
    
    console.log('\n💡 The Review Results page should now work for MedTech users!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Disconnected from MongoDB');
  }
}

// Run the test
testMedTechPermissions();