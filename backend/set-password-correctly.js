const mongoose = require('mongoose');
const User = require('./models/User');

async function setPasswordCorrectly() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find jasy user
    const user = await User.findOne({ email: 'jasy@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.firstName} ${user.lastName}`);
    
    // Set the password directly on passwordHash and let pre-save middleware handle it
    user.passwordHash = 'password123'; // Set plain text, pre-save will hash it
    user.isModified = () => true; // Force the pre-save middleware to run
    
    await user.save();
    console.log('✅ Password set using model pre-save middleware');
    
    // Reload user to get the hashed password
    const updatedUser = await User.findOne({ email: 'jasy@gmail.com' });
    console.log(`🔑 New password hash: ${updatedUser.passwordHash}`);
    
    // Test the password
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

setPasswordCorrectly();