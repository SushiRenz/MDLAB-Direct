const mongoose = require('mongoose');
const Log = require('./models/Log');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    createTestLogs();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestLogs() {
  try {
    console.log('🔄 Creating test log entries...');

    // Create some recent test logs with current dates
    const testLogs = [
      {
        action: 'User Login',
        details: 'Patient John Doe logged into the system',
        userEmail: 'john.doe@email.com',
        level: 'info',
        category: 'authentication',
        status: 'success',
        ipAddress: '192.168.1.100'
      },
      {
        action: 'Dashboard Access',
        details: 'Admin accessed main dashboard',
        userEmail: 'admin@mdlab.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.50'
      },
      {
        action: 'Patient Registration',
        details: 'New patient Maria Santos registered for laboratory services',
        userEmail: 'maria.santos@email.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.105'
      },
      {
        action: 'Service Booking',
        details: 'Patient booked Complete Blood Count (CBC) test',
        userEmail: 'carlos.rodriguez@email.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.110'
      },
      {
        action: 'Failed Login Attempt',
        details: 'Invalid password attempt for user: test@example.com',
        userEmail: 'test@example.com',
        level: 'warning',
        category: 'security',
        status: 'failed',
        ipAddress: '192.168.1.200'
      },
      {
        action: 'User Profile Update',
        details: 'Patient updated contact information and address',
        userEmail: 'anna.garcia@email.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.115'
      },
      {
        action: 'Lab Report Access',
        details: 'Patient downloaded laboratory test results PDF',
        userEmail: 'michael.chen@email.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.120'
      },
      {
        action: 'Mobile Lab Schedule',
        details: 'Admin scheduled mobile lab visit to Bayombong, Nueva Vizcaya',
        userEmail: 'admin@mdlab.com',
        level: 'info',
        category: 'user_action',
        status: 'success',
        ipAddress: '192.168.1.50'
      },
      {
        action: 'Payment Processing',
        details: 'Payment of ₱2,500 processed for patient laboratory services',
        userEmail: 'lisa.martinez@email.com',
        level: 'info',
        category: 'finance',
        status: 'success',
        ipAddress: '192.168.1.125'
      },
      {
        action: 'System Backup',
        details: 'Automated daily backup completed successfully',
        userEmail: 'system',
        level: 'info',
        category: 'system_event',
        status: 'success',
        ipAddress: '127.0.0.1'
      }
    ];

    // Create the logs with current timestamps
    for (const logData of testLogs) {
      await Log.createLog({
        ...logData,
        timestamp: new Date(), // Current timestamp
        metadata: {
          testData: true,
          createdAt: new Date().toISOString()
        }
      });
      
      // Add small delay to create different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Created', testLogs.length, 'test log entries');
    
    // Verify the logs were created
    const totalLogs = await Log.countDocuments();
    console.log('📊 Total logs in database:', totalLogs);
    
    // Show recent logs
    const recentLogs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('timestamp action userEmail level status');
    
    console.log('\n📋 Recent logs:');
    recentLogs.forEach(log => {
      console.log(`- ${log.timestamp.toLocaleString()} | ${log.level.toUpperCase()} | ${log.action} | ${log.userEmail} | ${log.status}`);
    });

  } catch (error) {
    console.error('❌ Error creating test logs:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Test completed, connection closed');
  }
}