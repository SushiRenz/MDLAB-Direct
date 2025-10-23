const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find both users
    const pennyUser = await User.findOne({ email: 'penny@gmail.com' });
    const jasyUser = await User.findOne({ email: 'jasy@gmail.com' });
    
    console.log('👥 User Status:');
    if (pennyUser) {
      console.log(`\n📧 Pen Penny (${pennyUser.email})`);
      console.log(`   Password defined: ${!!pennyUser.passwordHash}`);
      console.log(`   Account active: ${pennyUser.isActive !== false}`);
      console.log(`   Role: ${pennyUser.role}`);
    }
    
    if (jasyUser) {
      console.log(`\n📧 Jasy (${jasyUser.email})`);
      console.log(`   Password defined: ${!!jasyUser.passwordHash}`);
      console.log(`   Account active: ${jasyUser.isActive !== false}`);
      console.log(`   Role: ${jasyUser.role}`);
    }
    
    // Set password123 for both users
    console.log('\n🔧 Setting password123 for both users...');
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    if (pennyUser) {
      pennyUser.passwordHash = hashedPassword;
      pennyUser.isActive = true;
      await pennyUser.save();
      console.log('✅ Pen Penny password set');
    }
    
    if (jasyUser) {
      jasyUser.passwordHash = hashedPassword;
      jasyUser.isActive = true;
      await jasyUser.save();
      console.log('✅ Jasy password set');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();