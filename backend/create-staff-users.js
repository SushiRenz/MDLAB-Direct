const mongoose = require('mongoose');
const User = require('./models/User');

const createStaffUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/mdlab-direct');
    console.log('✅ Connected to MongoDB\n');

    // Staff users to create
    const staffUsers = [
      {
        username: 'admin1',
        email: 'admin1@mdlab.com',
        passwordHash: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        contactNumber: '+639000000001',
        address: 'MDLAB Direct Office',
        isActive: true
      },
      {
        username: 'medtech1',
        email: 'medtech1@mdlab.com',
        passwordHash: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'medtech',
        contactNumber: '+639000000003',
        address: 'MDLAB Direct Office',
        isActive: true
      },
      {
        username: 'pathologist1',
        email: 'pathologist1@mdlab.com',
        passwordHash: 'password123',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        role: 'pathologist',
        contactNumber: '+639000000004',
        address: 'MDLAB Direct Office',
        isActive: true
      },
      {
        username: 'receptionist1',
        email: 'receptionist1@mdlab.com',
        passwordHash: 'password123',
        firstName: 'Maria',
        lastName: 'Santos',
        role: 'receptionist',
        contactNumber: '+639000000005',
        address: 'MDLAB Direct Office',
        isActive: true
      }
    ];

    console.log('Creating staff users...\n');

    for (const userData of staffUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        console.log(`⏭️  ${userData.role} user "${userData.username}" already exists`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName}`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.passwordHash}\n`);
    }

    console.log('\n🎉 Staff users creation complete!');
    console.log('\n📝 Login Credentials:');
    console.log('='.repeat(50));
    staffUsers.forEach(user => {
      console.log(`\n${user.role.toUpperCase()}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Password: ${user.passwordHash}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createStaffUsers();
