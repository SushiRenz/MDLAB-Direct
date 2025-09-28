const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@mdlab.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '09123456789',
      address: {
        street: 'Main Office',
        city: 'Manila',
        province: 'NCR',
        zipCode: '1000'
      },
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@mdlab.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    mongoose.connection.close();
  }
};

if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };