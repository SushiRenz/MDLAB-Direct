const mongoose = require('mongoose');
const User = require('./models/User');

async function setPasswordForPenny() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find penny user
    const user = await User.findOne({ email: 'penny@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.firstName} ${user.lastName}`);
    
    // Set the password directly on passwordHash and let pre-save middleware handle it
    user.passwordHash = 'password123'; // Set plain text, pre-save will hash it
    
    await user.save();
    console.log('✅ Password set for Pen Penny');
    
    // Test the password
    const updatedUser = await User.findOne({ email: 'penny@gmail.com' });
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

setPasswordForPenny();