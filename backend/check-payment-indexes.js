const mongoose = require('mongoose');
const Payment = require('./models/Payment');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mdlab-direct')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function checkIndexes() {
  try {
    console.log('🔍 Checking Payment collection indexes...\n');
    
    const indexes = await Payment.collection.getIndexes();
    
    console.log('Current indexes:');
    for (const [name, definition] of Object.entries(indexes)) {
      console.log(`\n  Index: ${name}`);
      console.log(`  Fields:`, definition);
    }
    
    // Check for any duplicate values
    console.log('\n\n🔍 Checking for potential duplicate issues...\n');
    
    const paymentIdCounts = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (paymentIdCounts.length > 0) {
      console.log('⚠️ Found duplicate paymentIds:');
      paymentIdCounts.forEach(item => {
        console.log(`  - ${item._id}: ${item.count} occurrences`);
      });
    } else {
      console.log('✅ No duplicate paymentIds found');
    }
    
    const appointmentIdCounts = await Payment.aggregate([
      {
        $group: {
          _id: '$appointmentId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (appointmentIdCounts.length > 0) {
      console.log('\n⚠️ Found duplicate appointmentIds:');
      appointmentIdCounts.forEach(item => {
        console.log(`  - ${item._id}: ${item.count} occurrences`);
      });
    } else {
      console.log('✅ No duplicate appointmentIds found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

checkIndexes();
