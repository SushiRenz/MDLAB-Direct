const mongoose = require('mongoose');
const User = require('./models/User');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Reset password for marlowe account
    const user = await User.findOne({ email: 'marlo@gmail.com' });
    if (user) {
      // Set new password (will be hashed by pre-save middleware)
      user.passwordHash = 'password123';
      await user.save();
      
      console.log('✅ Password reset successful!');
      console.log('📧 Email: marlo@gmail.com');
      console.log('👤 Username: marlo');
      console.log('🔑 New Password: password123');
      
      // Test the new password
      const isMatch = await user.comparePassword('password123');
      console.log(`🔐 Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();