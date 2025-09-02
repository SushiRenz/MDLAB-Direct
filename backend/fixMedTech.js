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

// Test medtech password
const testMedTechPassword = async () => {
  await connectDB();
  
  console.log('🔐 Testing MedTech password...\n');
  
  const user = await User.findOne({ username: 'medtech1' });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  const testPasswords = [
    'MedTech123!',
    'medtech123',
    'medtech',
    'password',
    'admin',
    'MedTech123',
    'medtech1'
  ];
  
  console.log('Testing different passwords:');
  
  for (const password of testPasswords) {
    try {
      const isMatch = await user.comparePassword(password);
      console.log(`   "${password}" -> ${isMatch ? '✅ CORRECT' : '❌ Wrong'}`);
      
      if (isMatch) {
        console.log('\n🎉 Found the correct password!');
        break;
      }
    } catch (error) {
      console.log(`   "${password}" -> ❌ Error: ${error.message}`);
    }
  }
  
  // Also let's create a new medtech user with known credentials
  console.log('\n🔧 Creating a fresh medtech user with known credentials...');
  
  try {
    // Delete existing problematic user
    await User.deleteOne({ username: 'medtech1' });
    console.log('   Deleted existing medtech1 user');
    
    // Create new one
    const newUser = await User.create({
      username: 'medtech1',
      email: 'medtech@mdlab.com',
      passwordHash: 'MedTech123!', // Will be hashed by pre-save middleware
      firstName: 'John',
      lastName: 'Doe',
      role: 'medtech',
      phone: '+639111111111',
      isActive: true,
      isEmailVerified: true
    });
    
    console.log('   ✅ Created new medtech user:');
    console.log(`      Username: medtech1`);
    console.log(`      Password: MedTech123!`);
    console.log(`      Email: medtech@mdlab.com`);
    console.log(`      Name: John Doe`);
    
  } catch (error) {
    console.log(`   ❌ Error creating user: ${error.message}`);
  }
  
  mongoose.disconnect();
};

testMedTechPassword();
