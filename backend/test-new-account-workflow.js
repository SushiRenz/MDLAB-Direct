const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

const testNewAccountWorkflow = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('🧪 Testing New Account Workflow...\n');
    
    // 1. Find a recent patient account to test with
    const recentPatients = await User.find({ role: 'patient' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id firstName lastName email createdAt');
    
    console.log('📊 Recent patient accounts to test:');
    recentPatients.forEach((patient, i) => {
      console.log(`   ${i + 1}. ${patient.firstName} ${patient.lastName} (${patient.email})`);
      console.log(`      ID: ${patient._id}`);
      console.log(`      Created: ${patient.createdAt?.toLocaleDateString()}`);
    });
    
    if (recentPatients.length === 0) {
      console.log('❌ No patient accounts found');
      process.exit(1);
    }
    
    const testPatient = recentPatients[0];
    console.log(`\n🎯 Testing with: ${testPatient.firstName} ${testPatient.lastName}\n`);
    
    // 2. Simulate test result creation with different patient ID formats
    console.log('2. Testing patient ID recognition logic...');
    
    // Test ObjectId format
    console.log('\n   Testing with ObjectId format:');
    await testPatientIdRecognition(testPatient._id.toString(), testPatient);
    
    // Test email format
    console.log('\n   Testing with email format:');
    await testPatientIdRecognition(testPatient.email, testPatient);
    
    // 3. Test patient result fetching
    console.log('\n3. Testing patient result fetching...');
    await testPatientResultFetching(testPatient);
    
    console.log('\n✅ New account workflow test complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

const testPatientIdRecognition = async (patientId, expectedPatient) => {
  // Simulate the backend logic for patient recognition
  let patient = null;
  let isWalkInPatient = false;
  
  console.log('   🔍 Processing patient ID:', patientId, 'Type:', typeof patientId);
  
  // First, try to find by ObjectId if it looks like one
  if (patientId && patientId.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('      Attempting ObjectId lookup...');
    patient = await User.findById(patientId);
    if (patient && patient.role === 'patient') {
      console.log('      ✅ Found registered patient:', patient.firstName, patient.lastName);
    } else {
      console.log('      ❌ No registered patient found with this ObjectId');
    }
  } 
  
  // If not found as ObjectId, try to find by email (for registered accounts)
  if (!patient && patientId && patientId.includes('@')) {
    console.log('      Attempting email lookup...');
    patient = await User.findOne({ email: patientId, role: 'patient' });
    if (patient) {
      console.log('      ✅ Found registered patient by email:', patient.firstName, patient.lastName);
    } else {
      console.log('      ❌ No registered patient found with this email');
    }
  }
  
  // If we found a registered patient, use their ObjectId
  if (patient) {
    console.log('      📝 Result: Registered account - isWalkInPatient =', false);
    console.log('      📝 Patient field will be:', patient._id);
  } else {
    console.log('      📝 Result: Walk-in patient - isWalkInPatient =', true);
    console.log('      📝 Patient field will be:', patientId);
  }
  
  return { patient, isWalkInPatient };
};

const testPatientResultFetching = async (testPatient) => {
  console.log('   🔍 Testing result fetching for:', testPatient.firstName, testPatient.lastName);
  
  // Simulate the query conditions from the /my endpoint
  const queryConditions = [
    { patient: testPatient._id }, // Direct ObjectId match
    { patient: new mongoose.Types.ObjectId(testPatient._id) }, // Mongoose ObjectId match
    { patient: testPatient._id.toString() } // String ObjectId match
  ];
  
  // Also match by email
  if (testPatient.email) {
    queryConditions.push({ patient: testPatient.email });
  }
  
  const testResults = await TestResult.find({
    $and: [
      { $or: queryConditions },
      { status: 'released' },
      { patient: { $ne: null, $ne: undefined } },
      { isDeleted: { $ne: true } }
    ]
  });
  
  console.log(`   📊 Found ${testResults.length} released results for this patient`);
  
  if (testResults.length > 0) {
    testResults.forEach((result, i) => {
      console.log(`      ${i + 1}. ${result.testType} - Patient field: ${result.patient} (${typeof result.patient})`);
    });
  }
  
  return testResults;
};

testNewAccountWorkflow();