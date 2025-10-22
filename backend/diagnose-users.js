const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📡 Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function diagnoseUsers() {
  try {
    console.log('🔍 Diagnosing all users in database...\n');
    
    const users = await User.find({});
    
    console.log(`📊 Total users found: ${users.length}\n`);
    
    let usersWithoutPatientId = 0;
    let usersWithoutAddress = 0;
    let usersWithBadAddress = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`--- User ${i + 1} ---`);
      console.log(`👤 Username: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🏥 Role: ${user.role}`);
      
      // Check Patient ID
      if (!user.patientId) {
        console.log(`❌ MISSING PATIENT ID`);
        usersWithoutPatientId++;
      } else {
        console.log(`✅ Patient ID: ${user.patientId}`);
      }
      
      // Check Address
      if (!user.address) {
        console.log(`❌ MISSING ADDRESS`);
        usersWithoutAddress++;
      } else {
        console.log(`📍 Address (raw): ${JSON.stringify(user.address)}`);
        
        try {
          const formatted = user.formattedAddress;
          console.log(`🏠 Formatted Address: ${formatted}`);
          
          if (!formatted || formatted === 'undefined' || formatted === 'null') {
            console.log(`❌ BAD FORMATTED ADDRESS`);
            usersWithBadAddress++;
          }
        } catch (error) {
          console.log(`❌ ERROR FORMATTING ADDRESS: ${error.message}`);
          usersWithBadAddress++;
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('📋 SUMMARY:');
    console.log(`👥 Total users: ${users.length}`);
    console.log(`❌ Users without Patient ID: ${usersWithoutPatientId}`);
    console.log(`❌ Users without Address: ${usersWithoutAddress}`);
    console.log(`❌ Users with bad Address formatting: ${usersWithBadAddress}`);
    
    if (usersWithoutPatientId > 0 || usersWithoutAddress > 0 || usersWithBadAddress > 0) {
      console.log('\n🛠️  ISSUES FOUND! Users need to be fixed.');
    } else {
      console.log('\n✅ All users look good!');
    }
    
  } catch (error) {
    console.error('❌ Error diagnosing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
}

diagnoseUsers();