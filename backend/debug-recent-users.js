const mongoose = require('mongoose');
const User = require('./models/User');

async function debugRecentUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Find the most recent users (created in last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentUsers = await User.find({
      createdAt: { $gte: yesterday }
    }).sort({ createdAt: -1 });
    
    console.log(`\n👥 Recent users (last 24 hours): ${recentUsers.length}`);
    
    if (recentUsers.length === 0) {
      console.log('No recent users found. Showing last 5 users:');
      const lastUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
      
      lastUsers.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Password set: ${!!user.passwordHash}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Created: ${user.createdAt}`);
        console.log(`      Role: ${user.role}`);
      });
    } else {
      recentUsers.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Password set: ${!!user.passwordHash}`);
        console.log(`      Active: ${user.isActive}`);
        console.log(`      Created: ${user.createdAt}`);
        console.log(`      Role: ${user.role}`);
        
        // Test password if it exists
        if (user.passwordHash) {
          console.log(`      Password length: ${user.passwordHash.length}`);
        } else {
          console.log(`      ❌ NO PASSWORD HASH!`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugRecentUsers();