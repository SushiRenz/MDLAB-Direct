const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

const debugTestingQueueIssue = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('🔍 Debugging Testing Queue Button Issue...\n');
    
    // 1. Check the current checked-in appointments
    const checkedInAppointments = await Appointment.find({ status: 'checked-in' })
      .populate('patient', 'firstName lastName email')
      .sort({ appointmentDate: 1 })
      .limit(10);
    
    console.log(`📊 Found ${checkedInAppointments.length} checked-in appointments:`);
    
    for (const appointment of checkedInAppointments) {
      console.log(`\n🎯 Appointment: ${appointment.patientName}`);
      console.log(`   ID: ${appointment._id}`);
      console.log(`   Patient Account: ${appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'None (Walk-in)'}`);
      console.log(`   Status: ${appointment.status}`);
      
      // Find test results for this appointment
      const testResults = await TestResult.find({
        appointment: appointment._id,
        isDeleted: { $ne: true }
      }).select('_id status testType sampleDate createdAt');
      
      console.log(`   Test Results: ${testResults.length}`);
      
      if (testResults.length > 0) {
        testResults.forEach((result, i) => {
          console.log(`     ${i + 1}. ${result.testType} - Status: ${result.status} - Created: ${result.createdAt?.toLocaleString()}`);
        });
        
        // Check what the checkExistingDrafts logic would determine
        const latestResult = testResults[testResults.length - 1]; // Most recent
        let buttonText = 'Input Results';
        let isCompleted = false;
        
        if (latestResult.status === 'pending' && latestResult.rejectionReason) {
          buttonText = 'Re-enter Results';
        } else if (latestResult.status === 'completed' || latestResult.status === 'reviewed') {
          buttonText = 'View Results';
          isCompleted = true;
        } else if (latestResult.status === 'in-progress' || latestResult.status === 'pending') {
          buttonText = 'Continue Draft';
        }
        
        console.log(`   🔍 Expected Button: "${buttonText}" (isCompleted: ${isCompleted})`);
      } else {
        console.log(`   🔍 Expected Button: "Input Results" (no test results found)`);
      }
    }
    
    // 2. Check specifically for reviewed/approved results
    console.log('\n📋 Checking for approved results that should show "View Results":');
    const approvedResults = await TestResult.find({
      status: { $in: ['reviewed', 'released'] },
      isDeleted: { $ne: true }
    })
    .populate('appointment', 'patientName status')
    .sort({ updatedAt: -1 })
    .limit(10);
    
    console.log(`Found ${approvedResults.length} approved/released results:`);
    approvedResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.testType} - Status: ${result.status}`);
      console.log(`      Appointment: ${result.appointment?.patientName} (${result.appointment?.status})`);
      console.log(`      Should show: "View Results"`);
    });
    
    console.log('\n✅ Debug analysis complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
};

debugTestingQueueIssue();