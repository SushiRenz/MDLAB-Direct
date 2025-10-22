const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📡 Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Function to generate Patient ID (copied from User model)
function generatePatientId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'P';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function fixAllUsers() {
  try {
    console.log('🛠️  Starting to fix all users...\n');
    
    const users = await User.find({});
    console.log(`📊 Total users to process: ${users.length}\n`);
    
    let fixedPatientIds = 0;
    let fixedAddresses = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let needsUpdate = false;
      let updates = {};
      
      console.log(`--- Processing User ${i + 1}: ${user.username} (${user.role}) ---`);
      
      // Fix missing Patient ID
      if (!user.patientId) {
        const newPatientId = generatePatientId();
        updates.patientId = newPatientId;
        needsUpdate = true;
        fixedPatientIds++;
        console.log(`✅ Added Patient ID: ${newPatientId}`);
      } else {
        console.log(`✅ Patient ID already exists: ${user.patientId}`);
      }
      
      // Fix missing Address
      if (!user.address) {
        // Set default address based on role
        let defaultAddress;
        switch (user.role) {
          case 'patient':
            defaultAddress = 'Address not provided';
            break;
          case 'admin':
          case 'owner':
            defaultAddress = 'MDLAB Direct Admin Office';
            break;
          case 'medtech':
            defaultAddress = 'MDLAB Direct Laboratory';
            break;
          case 'pathologist':
            defaultAddress = 'MDLAB Direct Medical Office';
            break;
          case 'receptionist':
            defaultAddress = 'MDLAB Direct Front Desk';
            break;
          default:
            defaultAddress = 'MDLAB Direct Facility';
        }
        
        updates.address = defaultAddress;
        needsUpdate = true;
        fixedAddresses++;
        console.log(`✅ Added default address: ${defaultAddress}`);
      } else {
        console.log(`✅ Address already exists`);
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        try {
          await User.findByIdAndUpdate(user._id, updates, { new: true });
          console.log(`✅ User updated successfully`);
        } catch (error) {
          console.log(`❌ Error updating user: ${error.message}`);
        }
      } else {
        console.log(`✅ No updates needed`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('📋 FIX SUMMARY:');
    console.log(`👥 Total users processed: ${users.length}`);
    console.log(`🆔 Patient IDs added: ${fixedPatientIds}`);
    console.log(`📍 Addresses added: ${fixedAddresses}`);
    console.log('✅ All users have been fixed!');
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const updatedUsers = await User.find({});
    
    let missingPatientIds = 0;
    let missingAddresses = 0;
    
    for (const user of updatedUsers) {
      if (!user.patientId) missingPatientIds++;
      if (!user.address) missingAddresses++;
    }
    
    console.log(`❌ Still missing Patient IDs: ${missingPatientIds}`);
    console.log(`❌ Still missing Addresses: ${missingAddresses}`);
    
    if (missingPatientIds === 0 && missingAddresses === 0) {
      console.log('🎉 All issues have been resolved!');
    } else {
      console.log('⚠️  Some issues remain. Please check manually.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
}

fixAllUsers();