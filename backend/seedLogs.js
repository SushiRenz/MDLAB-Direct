const mongoose = require('mongoose');
const Log = require('./models/Log');
require('dotenv').config();

async function seedLogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for log seeding');

    // Clear existing logs (optional - remove in production)
    await Log.deleteMany({});
    console.log('🗑️ Cleared existing logs');

    // Create sample log entries
    const sampleLogs = [
      // Recent logs (today)
      {
        level: 'info',
        action: 'User Login',
        details: 'Successful authentication',
        userEmail: 'admin@mdlab.com',
        ipAddress: '192.168.1.112',
        status: 'success',
        category: 'authentication',
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      },
      {
        level: 'info',
        action: 'Test Result Entry',
        details: 'Updated CBC results for patient P001',
        userEmail: 'medtech1@mdlab.com',
        ipAddress: '192.168.1.115',
        status: 'success',
        category: 'user_action',
        timestamp: new Date(Date.now() - 1000 * 60 * 22) // 22 minutes ago
      },
      {
        level: 'warning',
        action: 'Database Connection',
        details: 'Connection timeout, retried successfully',
        userEmail: 'system',
        ipAddress: '127.0.0.1',
        status: 'resolved',
        category: 'database',
        timestamp: new Date(Date.now() - 1000 * 60 * 35) // 35 minutes ago
      },
      {
        level: 'error',
        action: 'Login Attempt',
        details: 'Failed login - incorrect password',
        userEmail: 'patient123@email.com',
        ipAddress: '203.177.45.123',
        status: 'failed',
        category: 'authentication',
        timestamp: new Date(Date.now() - 1000 * 60 * 40) // 40 minutes ago
      },
      {
        level: 'info',
        action: 'Report Generation',
        details: 'Generated pathology report for case C-2024-0891',
        userEmail: 'pathologist1@mdlab.com',
        ipAddress: '192.168.1.118',
        status: 'success',
        category: 'user_action',
        timestamp: new Date(Date.now() - 1000 * 60 * 55) // 55 minutes ago
      },
      {
        level: 'critical',
        action: 'Security Event',
        details: 'Multiple failed login attempts detected',
        userEmail: 'unknown',
        ipAddress: '45.133.247.89',
        status: 'blocked',
        category: 'security',
        timestamp: new Date(Date.now() - 1000 * 60 * 75) // 75 minutes ago
      },
      {
        level: 'info',
        action: 'Bill Creation',
        details: 'Created bill BL-2024-001 for patient Maria Santos',
        userEmail: 'admin@mdlab.com',
        ipAddress: '192.168.1.112',
        status: 'success',
        category: 'finance',
        timestamp: new Date(Date.now() - 1000 * 60 * 90) // 90 minutes ago
      },
      {
        level: 'info',
        action: 'Payment Processing',
        details: 'Processed payment PAY-2024-001 amount ₱2,500',
        userEmail: 'admin@mdlab.com',
        ipAddress: '192.168.1.112',
        status: 'success',
        category: 'finance',
        timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
      },
      {
        level: 'warning',
        action: 'API Rate Limit',
        details: 'Rate limit exceeded for IP 192.168.1.200',
        userEmail: 'system',
        ipAddress: '192.168.1.200',
        status: 'warning',
        category: 'api',
        timestamp: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
      },
      {
        level: 'info',
        action: 'User Registration',
        details: 'New patient registered: John Doe',
        userEmail: 'admin@mdlab.com',
        ipAddress: '192.168.1.112',
        status: 'success',
        category: 'user_action',
        timestamp: new Date(Date.now() - 1000 * 60 * 240) // 4 hours ago
      },

      // Yesterday's logs
      {
        level: 'info',
        action: 'System Backup',
        details: 'Daily database backup completed successfully',
        userEmail: 'system',
        ipAddress: '127.0.0.1',
        status: 'success',
        category: 'system_event',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) // 25 hours ago
      },
      {
        level: 'error',
        action: 'Email Service',
        details: 'Failed to send notification email to patient@example.com',
        userEmail: 'system',
        ipAddress: '127.0.0.1',
        status: 'failed',
        category: 'system_event',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) // 26 hours ago
      },
      {
        level: 'info',
        action: 'User Logout',
        details: 'User logged out successfully',
        userEmail: 'medtech2@mdlab.com',
        ipAddress: '192.168.1.116',
        status: 'success',
        category: 'authentication',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27) // 27 hours ago
      },

      // Older logs (2-3 days ago)
      {
        level: 'warning',
        action: 'Storage Space',
        details: 'Storage space is 85% full',
        userEmail: 'system',
        ipAddress: '127.0.0.1',
        status: 'warning',
        category: 'system_event',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) // 48 hours ago
      },
      {
        level: 'info',
        action: 'System Update',
        details: 'Applied security patch v1.2.3',
        userEmail: 'system',
        ipAddress: '127.0.0.1',
        status: 'success',
        category: 'system_event',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72) // 72 hours ago
      }
    ];

    // Insert sample logs
    const createdLogs = await Log.insertMany(sampleLogs);
    console.log(`✅ Created ${createdLogs.length} sample log entries`);

    // Add some additional logs using the static methods
    await Log.logInfo(
      'Log Seeding',
      'System logs database seeded with sample data',
      'system',
      '127.0.0.1',
      { seedCount: createdLogs.length }
    );

    await Log.logSecurity(
      'Brute Force Attempt',
      'Blocked IP after 5 failed login attempts',
      'unknown',
      '185.220.101.45',
      'blocked',
      { attemptCount: 5, blockDuration: '1 hour' }
    );

    await Log.logUserAction(
      'Data Export',
      'Exported user report in CSV format',
      'admin@mdlab.com',
      '192.168.1.112',
      'success',
      { exportType: 'CSV', recordCount: 150 }
    );

    console.log('✅ Additional logs created using static methods');
    console.log('\n🌱 Log seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding logs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedLogs();
}

module.exports = seedLogs;