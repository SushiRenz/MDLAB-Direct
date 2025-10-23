const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetJasyPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find jasy user
    const jasyUser = await User.findOne({ email: 'jasy@gmail.com' });
    if (!jasyUser) {
      console.log('❌ Jasy user not found');
      return;
    }
    
    console.log(`👤 Found Jasy: ${jasyUser.firstName} ${jasyUser.lastName}`);
    console.log(`📧 Email: ${jasyUser.email}`);
    console.log(`🔑 Current password hash: ${jasyUser.password ? jasyUser.password.substring(0, 20) + '...' : 'UNDEFINED'}`);
    
    // Reset password to 'password123'
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    jasyUser.password = hashedPassword;
    await jasyUser.save();
    
    console.log(`✅ Password reset to '${newPassword}'`);
    console.log(`🔑 New password hash: ${hashedPassword.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetJasyPassword();