const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const debugFullDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n=== FULL DATABASE DEBUG ===\n');
    
    // 1. Get all users
    const users = await User.find({}).select('_id firstName lastName email role');
    console.log('📊 All users:', users.length);
    users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user._id}`);
    });
    
    // 2. Get all appointments
    const appointments = await Appointment.find({}).select('_id patientName status appointmentDate');
    console.log(`\n📊 All appointments: ${appointments.length}`);
    appointments.forEach(appointment => {
      console.log(`   - ${appointment._id} | ${appointment.patientName} | ${appointment.status} | ${appointment.appointmentDate?.toLocaleDateString()}`);
    });
    
    // 3. Get ALL test results (including soft deleted)
    const allResults = await TestResult.find({}) // Remove isDeleted filter
      .populate('patient', 'firstName lastName email')
      .populate('appointment', 'patientName')
      .select('_id patient appointment status sampleDate testType isWalkInPatient isDeleted');
    
    console.log(`\n📊 ALL test results (including deleted): ${allResults.length}`);
    
    allResults.forEach(result => {
      const patientInfo = result.isWalkInPatient 
        ? `Walk-in: ${result.appointment?.patientName || 'Unknown'}`
        : `Account: ${result.patient?.firstName} ${result.patient?.lastName} (${result.patient?._id})`;
      
      const deletedFlag = result.isDeleted ? ' [DELETED]' : '';
      console.log(`   - ${result._id} | ${patientInfo} | ${result.testType} | ${result.status} | ${result.sampleDate?.toLocaleDateString()}${deletedFlag}`);
    });
    
    // 4. Check database collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Database collections: ${collections.length}`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // 5. Check specific collection document counts
    const testResultCount = await mongoose.connection.db.collection('testresults').countDocuments();
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const appointmentCount = await mongoose.connection.db.collection('appointments').countDocuments();
    
    console.log(`\n📊 Collection document counts:`);
    console.log(`   - testresults: ${testResultCount}`);
    console.log(`   - users: ${userCount}`);
    console.log(`   - appointments: ${appointmentCount}`);
    
    console.log('\n=== FULL DEBUG COMPLETE ===');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
};

debugFullDatabase();