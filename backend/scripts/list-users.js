const mongoose = require('mongoose');
const User = require('../models/User');

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('📡 Connected to MongoDB');

    // Get all users by role
    const users = await User.find({}).select('username email role firstName lastName isActive');
    
    console.log('\n👥 All users in the system:');
    console.log('==========================================');
    
    const roleGroups = {};
    users.forEach(user => {
      if (!roleGroups[user.role]) {
        roleGroups[user.role] = [];
      }
      roleGroups[user.role].push(user);
    });
    
    Object.keys(roleGroups).forEach(role => {
      console.log(`\n${role.toUpperCase()} USERS:`);
      roleGroups[role].forEach(user => {
        console.log(`  • ${user.firstName} ${user.lastName}`);
        console.log(`    Username: ${user.username}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();