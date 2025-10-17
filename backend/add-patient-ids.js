const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const addPatientIdsToExistingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all patients without patient IDs
    const patientsWithoutIds = await User.find({ 
      role: 'patient', 
      $or: [
        { patientId: { $exists: false } },
        { patientId: null },
        { patientId: '' }
      ]
    });

    console.log(`Found ${patientsWithoutIds.length} patients without patient IDs`);

    for (const patient of patientsWithoutIds) {
      let patientId;
      let isUnique = false;
      let attempts = 0;
      
      // Generate unique patient ID
      while (!isUnique && attempts < 10) {
        patientId = 'P' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
        const existingUser = await User.findOne({ patientId });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      if (isUnique) {
        await User.updateOne(
          { _id: patient._id },
          { $set: { patientId } }
        );
        console.log(`✅ Generated patient ID ${patientId} for ${patient.firstName} ${patient.lastName}`);
      } else {
        console.log(`❌ Failed to generate unique patient ID for ${patient.firstName} ${patient.lastName}`);
      }
    }

    console.log('✅ Patient ID generation completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addPatientIdsToExistingUsers();