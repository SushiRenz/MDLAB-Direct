const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createMedTech() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('📡 Connected to MongoDB');

    // Check if medtech user already exists
    const existingMedTech = await User.findOne({ role: 'medtech' });
    if (existingMedTech) {
      console.log('⚠️ MedTech user already exists:');
      console.log('   Username:', existingMedTech.username);
      console.log('   Email:', existingMedTech.email);
      console.log('   Name:', `${existingMedTech.firstName} ${existingMedTech.lastName}`);
      process.exit(0);
    }

    // Create medtech user
    const hashedPassword = await bcrypt.hash('medtech123', 12);
    
    const medtechUser = new User({
      username: 'medtech',
      email: 'medtech@mdlab.com',
      passwordHash: hashedPassword,
      role: 'medtech',
      firstName: 'Med',
      lastName: 'Tech',
      phone: '09123456789',
      address: 'MDLAB Clinic',
      isActive: true,
      emailVerified: true
    });

    await medtechUser.save();
    
    console.log('✅ MedTech user created successfully!');
    console.log('   Username: medtech');
    console.log('   Password: medtech123');
    console.log('   Email: medtech@mdlab.com');
    console.log('   Role: medtech');
    
  } catch (error) {
    console.error('❌ Error creating medtech user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createMedTech();