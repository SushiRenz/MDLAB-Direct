const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'email username firstName lastName role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log('\n📋 All Users (most recent first):');
    console.log('================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || 'NOT SET'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ---`);
    });
    
    const patientCount = await User.countDocuments({ role: 'patient' });
    const totalCount = await User.countDocuments();
    console.log(`\n📊 Total users: ${totalCount}`);
    console.log(`📊 Total patients: ${patientCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();