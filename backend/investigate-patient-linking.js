const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

const investigatePatientLinking = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('🔍 Investigating Patient ID Linking for New vs Old Accounts...\n');
    
    // 1. Check all patients and their test results
    const allPatients = await User.find({ role: 'patient' })
      .select('_id firstName lastName email createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${allPatients.length} patient accounts:`);
    console.log('Recent patients (newest first):');
    
    for (let i = 0; i < Math.min(10, allPatients.length); i++) {
      const patient = allPatients[i];
      console.log(`   ${i + 1}. ${patient.firstName} ${patient.lastName} (${patient.email})`);
      console.log(`      ID: ${patient._id}`);
      console.log(`      Created: ${patient.createdAt?.toLocaleDateString()}`);
      
      // Check test results for this patient - try multiple query methods
      const resultsByObjectId = await TestResult.find({ 
        patient: patient._id,
        isDeleted: { $ne: true }
      }).countDocuments();
      
      const resultsByStringId = await TestResult.find({ 
        patient: patient._id.toString(),
        isDeleted: { $ne: true }
      }).countDocuments();
      
      const releasedResults = await TestResult.find({
        $or: [
          { patient: patient._id },
          { patient: patient._id.toString() }
        ],
        status: 'released',
        isDeleted: { $ne: true }
      }).countDocuments();
      
      console.log(`      Test Results (ObjectId): ${resultsByObjectId}`);
      console.log(`      Test Results (String): ${resultsByStringId}`);
      console.log(`      Released Results: ${releasedResults}`);
      console.log('');
    }
    
    // 2. Check how appointments are linked to patients
    console.log('\n🔗 Checking Appointment-Patient Linking:');
    const recentAppointments = await Appointment.find({ patient: { $exists: true } })
      .populate('patient', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('Recent appointments with patient accounts:');
    recentAppointments.forEach((apt, i) => {
      console.log(`   ${i + 1}. ${apt.patientName} (Appointment)`);
      console.log(`      Patient Account: ${apt.patient?.firstName} ${apt.patient?.lastName} (${apt.patient?._id})`);
      console.log(`      Status: ${apt.status}`);
      console.log('');
    });
    
    // 3. Check test results creation pattern
    console.log('\n⚙️ Analyzing Test Result Creation Patterns:');
    const recentResults = await TestResult.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('Recent test results:');
    for (let i = 0; i < recentResults.length; i++) {
      const result = recentResults[i];
      console.log(`   ${i + 1}. ${result.testType} (${result._id})`);
      console.log(`      Patient Field: ${result.patient} (${typeof result.patient})`);
      console.log(`      Is Walk-in: ${result.isWalkInPatient}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Created: ${result.createdAt?.toLocaleDateString()}`);
      
      // Try to find the actual patient
      if (result.patient && !result.isWalkInPatient) {
        try {
          const actualPatient = await User.findById(result.patient);
          console.log(`      Linked Patient: ${actualPatient ? `${actualPatient.firstName} ${actualPatient.lastName}` : 'NOT FOUND'}`);
        } catch (error) {
          console.log(`      Patient Lookup Error: ${error.message}`);
        }
      }
      console.log('');
    }
    
    console.log('✅ Investigation complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Investigation error:', error);
    process.exit(1);
  }
};

investigatePatientLinking();