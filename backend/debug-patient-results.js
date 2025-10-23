const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/mdlab-direct');
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const debugPatientResults = async () => {
  try {
    await connectDB();
    
    console.log('\n=== DEBUGGING PATIENT RESULTS ===\n');
    
    // 1. Get all patients
    const patients = await User.find({ role: 'patient' }).select('_id firstName lastName email');
    console.log('📊 Found patients:', patients.length);
    patients.forEach(patient => {
      console.log(`   - ${patient.firstName} ${patient.lastName} (${patient._id})`);
    });
    
    // 2. Get all test results
    const allResults = await TestResult.find({ isDeleted: false })
      .populate('patient', 'firstName lastName email')
      .populate('appointment', 'patientName')
      .select('_id patient appointment status sampleDate testType isWalkInPatient');
    
    console.log(`\n📊 Found test results: ${allResults.length}`);
    
    // 3. Group by status
    const statusGroups = {};
    allResults.forEach(result => {
      const status = result.status || 'unknown';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(result);
    });
    
    console.log('\n📈 Results by status:');
    Object.keys(statusGroups).forEach(status => {
      console.log(`   ${status}: ${statusGroups[status].length} results`);
    });
    
    // 4. Check specifically for 'released' results
    const releasedResults = allResults.filter(result => result.status === 'released');
    console.log(`\n🔍 RELEASED RESULTS (${releasedResults.length}):`);
    
    releasedResults.forEach(result => {
      const patientInfo = result.isWalkInPatient 
        ? `Walk-in: ${result.appointment?.patientName || 'Unknown'}`
        : `Account: ${result.patient?.firstName} ${result.patient?.lastName} (${result.patient?._id})`;
      
      console.log(`   - ${result._id} | ${patientInfo} | ${result.testType} | ${result.sampleDate?.toLocaleDateString()}`);
    });
    
    // 5. Check for 'reviewed' results that should be released
    const reviewedResults = allResults.filter(result => result.status === 'reviewed');
    console.log(`\n🔍 REVIEWED (APPROVED) RESULTS NOT YET RELEASED (${reviewedResults.length}):`);
    
    reviewedResults.forEach(result => {
      const patientInfo = result.isWalkInPatient 
        ? `Walk-in: ${result.appointment?.patientName || 'Unknown'}`
        : `Account: ${result.patient?.firstName} ${result.patient?.lastName} (${result.patient?._id})`;
      
      console.log(`   - ${result._id} | ${patientInfo} | ${result.testType} | ${result.sampleDate?.toLocaleDateString()}`);
    });
    
    // 6. For each patient, check what they should see
    console.log('\n🔍 PATIENT RESULT VISIBILITY CHECK:');
    for (const patient of patients) {
      const patientResults = await TestResult.find({
        $or: [
          { patient: patient._id },
          { patient: new mongoose.Types.ObjectId(patient._id) }
        ],
        status: 'released'
      }).select('_id testType sampleDate status');
      
      console.log(`   ${patient.firstName} ${patient.lastName}: ${patientResults.length} visible results`);
      patientResults.forEach(result => {
        console.log(`     - ${result.testType} (${result.sampleDate?.toLocaleDateString()}) - ${result.status}`);
      });
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
};

debugPatientResults();