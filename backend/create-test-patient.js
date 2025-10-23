const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestPatient() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    // Check if test patient already exists
    const existingUser = await User.findOne({ email: 'patient@test.com' });
    if (existingUser) {
      console.log('✅ Test patient already exists:', existingUser.email);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test patient
    const testPatient = new User({
      username: 'testpatient',
      email: 'patient@test.com',
      passwordHash: 'password123', // This will be hashed by the pre-save middleware
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient',
      isActive: true,
      isEmailVerified: true,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      address: 'Test Address'
    });
    
    await testPatient.save();
    console.log('✅ Test patient created successfully!');
    console.log('📧 Email: patient@test.com');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test patient:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestPatient();