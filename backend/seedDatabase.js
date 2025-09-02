const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Create default admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create default admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@mdlab.com',
      passwordHash: 'Admin123!', // Will be hashed by pre-save middleware
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '+639123456789',
      isActive: true,
      isEmailVerified: true
    };

    const user = await User.create(adminUser);
    console.log('✅ Default admin user created successfully:');
    console.log('   Email: admin@mdlab.com');
    console.log('   Username: admin');
    console.log('   Password: Admin123!');
    console.log('   Role: admin');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// Create IT admin account for development/testing
const createITAdminUser = async () => {
  try {
    // Check if IT admin user already exists
    const existingITAdmin = await User.findOne({ username: 'adminZero' });
    
    if (existingITAdmin) {
      console.log('IT Admin user already exists:', existingITAdmin.username);
      return;
    }

    // Create IT admin user - No email required, username-only login
    const itAdminUser = {
      username: 'adminZero',
      email: 'adminzero@mdlab.com', // Valid email format for system purposes
      passwordHash: 'adminZero_25', // Will be hashed by pre-save middleware
      firstName: 'IT',
      lastName: 'Administrator',
      role: 'admin',
      phone: '+639000000000',
      isActive: true,
      isEmailVerified: true
    };

    const user = await User.create(itAdminUser);
    console.log('✅ IT Admin user created successfully:');
    console.log('   Username: adminZero');
    console.log('   Password: adminZero_25');
    console.log('   Role: admin');
    console.log('   🔧 This is your personal IT admin account for testing/debugging');

  } catch (error) {
    console.error('Error creating IT admin user:', error.message);
  }
};

// Create sample users for testing
const createSampleUsers = async () => {
  try {
    const sampleUsers = [
      {
        username: 'medtech1',
        email: 'medtech@mdlab.com',
        passwordHash: 'MedTech123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'medtech',
        phone: '+639111111111',
        isActive: true,
        isEmailVerified: true
      },
      {
        username: 'pathologist1',
        email: 'pathologist@mdlab.com',
        passwordHash: 'Pathologist123!',
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        role: 'pathologist',
        phone: '+639222222222',
        isActive: true,
        isEmailVerified: true
      },
      {
        username: 'patient1',
        email: 'patient@example.com',
        passwordHash: 'Patient123!',
        firstName: 'Maria',
        lastName: 'Santos',
        role: 'patient',
        phone: '+639333333333',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'female',
        address: {
          street: '123 Sample Street',
          city: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000'
        },
        isActive: true
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Sample user created: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

  } catch (error) {
    console.error('Error creating sample users:', error.message);
  }
};

// Main seeding function
const seedDatabase = async () => {
  await connectDB();
  
  console.log('🌱 Starting database seeding...\n');
  
  await createAdminUser();
  await createITAdminUser();
  await createSampleUsers();
  
  console.log('\n✅ Database seeding completed!');
  
  // Display user summary
  const userCount = await User.countDocuments();
  const adminCount = await User.countDocuments({ role: 'admin' });
  const medtechCount = await User.countDocuments({ role: 'medtech' });
  const pathologistCount = await User.countDocuments({ role: 'pathologist' });
  const patientCount = await User.countDocuments({ role: 'patient' });
  
  console.log('\n📊 User Summary:');
  console.log(`   Total Users: ${userCount}`);
  console.log(`   Admins: ${adminCount}`);
  console.log(`   Med Techs: ${medtechCount}`);
  console.log(`   Pathologists: ${pathologistCount}`);
  console.log(`   Patients: ${patientCount}`);
  
  console.log('\n🔧 IT Admin Account for Testing:');
  console.log('   Username: adminZero');
  console.log('   Password: adminZero_25');
  console.log('   Access: Full admin privileges');
  
  mongoose.disconnect();
};

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
