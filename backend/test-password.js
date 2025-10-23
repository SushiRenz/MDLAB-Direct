const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testPasswordDirectly() {
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
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password hash: ${user.passwordHash}`);
    console.log(`🟢 Active: ${user.isActive}`);
    
    // Test password comparison
    const testPassword = 'password123';
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
      console.log(`\n🔍 Testing password '${testPassword}' with bcrypt.compare:`);
      console.log(`   Match result: ${isMatch ? '✅ MATCHES' : '❌ NO MATCH'}`);
    } else {
      console.log('\n❌ No password hash found');
    }
    
    // Test the User model's comparePassword method
    if (typeof user.comparePassword === 'function') {
      try {
        const modelMatch = await user.comparePassword(testPassword);
        console.log(`\n🔍 Testing with user.comparePassword method:`);
        console.log(`   Model method: ${modelMatch ? '✅ MATCHES' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`\n❌ Error with comparePassword: ${error.message}`);
      }
    } else {
      console.log('   No comparePassword method found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testPasswordDirectly();