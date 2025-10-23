const mongoose = require('mongoose');
const User = require('./models/User');

async function debugUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'marlo@gmail.com' });
    if (user) {
      console.log('✅ Found user:', {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        passwordHash: user.passwordHash ? '***EXISTS***' : 'NOT SET',
        loginAttempts: user.loginAttempts || 0,
        accountLocked: user.accountLocked || false
      });
      
      // Test password comparison
      const testPasswords = ['password123', 'marlowe123', 'marlo123', '123456', 'password', 'admin123'];
      console.log('🔑 Testing common passwords:');
      for (const testPassword of testPasswords) {
        const isMatch = await user.comparePassword(testPassword);
        console.log(`   "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        if (isMatch) break;
      }
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugUser();