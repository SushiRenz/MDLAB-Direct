const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Check medtech users
const checkMedTechUsers = async () => {
  await connectDB();
  
  console.log('🔍 Checking MedTech users in database...\n');
  
  // Find all medtech users
  const medtechUsers = await User.find({ role: 'medtech' });
  
  console.log(`Found ${medtechUsers.length} MedTech users:`);
  
  medtechUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. MedTech User:`);
    console.log(`   Username: "${user.username}"`);
    console.log(`   Email: "${user.email}"`);
    console.log(`   Full Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
    console.log(`   Is Locked: ${user.isLocked}`);
  });
  
  // Also check all users to see if medtech1 exists with different role
  console.log('\n🔍 Checking if "medtech1" exists with any role...');
  const medtech1User = await User.findOne({ 
    $or: [
      { username: 'medtech1' },
      { email: 'medtech1' }
    ]
  });
  
  if (medtech1User) {
    console.log('✅ Found medtech1 user:');
    console.log(`   Username: "${medtech1User.username}"`);
    console.log(`   Email: "${medtech1User.email}"`);
    console.log(`   Role: ${medtech1User.role}`);
    console.log(`   Active: ${medtech1User.isActive}`);
  } else {
    console.log('❌ No user found with username or email "medtech1"');
  }
  
  mongoose.disconnect();
};

checkMedTechUsers();
