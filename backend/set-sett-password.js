const mongoose = require('mongoose');
const User = require('./models/User');

async function setSettPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find sett user
    const user = await User.findById('68f908c8b5239165aa91b2e2');
    console.log(`👤 Found user: ${user.firstName} ${user.lastName}`);
    
    // Set the password using the model's pre-save middleware
    user.passwordHash = 'password123'; // Set plain text, pre-save will hash it
    
    await user.save();
    console.log('✅ Password set for Sett');
    
    // Test the password
    const updatedUser = await User.findById('68f908c8b5239165aa91b2e2');
    const testPassword = 'password123';
    const isMatch = await updatedUser.comparePassword(testPassword);
    console.log(`\n🔍 Testing password '${testPassword}':`);
    console.log(`   Match result: ${isMatch ? '✅ MATCHES' : '❌ NO MATCH'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setSettPassword();