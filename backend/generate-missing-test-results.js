const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');
const Service = require('./models/Service');
const User = require('./models/User');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mdlab', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function generateMissingTestResults() {
  try {
    console.log('🔬 Generating test results for completed appointments...\n');

    // Find all completed appointments
    const completedAppointments = await Appointment.find({ 
      status: 'completed' 
    }).populate('service').populate('patient');

    console.log(`📋 Found ${completedAppointments.length} completed appointments`);

    // Find a default user to use as creator (medtech or admin)
    let defaultUser = await User.findOne({ role: 'medtech' });
    if (!defaultUser) {
      defaultUser = await User.findOne({ role: 'admin' });
    }
    if (!defaultUser) {
      defaultUser = await User.findOne({ role: 'receptionist' });
    }

    if (!defaultUser) {
      console.log('❌ No suitable user found to create test results');
      return;
    }

    console.log(`👤 Using ${defaultUser.firstName} ${defaultUser.lastName} (${defaultUser.role}) as creator\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const appointment of completedAppointments) {
      // Check if test result already exists
      const existingResult = await TestResult.findOne({ 
        appointment: appointment._id 
      });

      if (existingResult) {
        console.log(`⚠️ Test result already exists for appointment ${appointment.appointmentId} - skipping`);
        skippedCount++;
        continue;
      }

      // Determine test type
      let testType = 'General Lab Test';
      if (appointment.serviceName) {
        testType = appointment.serviceName;
      } else if (appointment.service && appointment.service.serviceName) {
        testType = appointment.service.serviceName;
      }

      // Prepare test result data
      const testResultData = {
        appointment: appointment._id,
        service: appointment.service ? appointment.service._id : null,
        testType: testType,
        sampleDate: appointment.appointmentDate || appointment.createdAt,
        status: 'completed', // Mark as completed since appointment is already done
        createdBy: defaultUser._id,
        completedAt: appointment.checkedOutAt || appointment.updatedAt,
        notes: `Auto-generated test result for completed appointment ${appointment.appointmentId}`
      };

      // Handle patient data
      if (appointment.patient && typeof appointment.patient === 'object' && appointment.patient._id) {
        // Registered patient
        testResultData.patient = appointment.patient._id;
        testResultData.isWalkInPatient = false;
      } else {
        // Walk-in patient
        testResultData.patient = appointment.patient || `WALKIN-${appointment.patientName?.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
        testResultData.isWalkInPatient = true;
        testResultData.patientInfo = {
          name: appointment.patientName,
          age: appointment.age,
          gender: appointment.sex,
          address: appointment.address,
          contactNumber: appointment.contactNumber
        };
      }

      // Create sample results based on test type
      const results = new Map();
      
      // Add common test results based on test type
      if (testType.toLowerCase().includes('blood') || testType.toLowerCase().includes('cbc')) {
        results.set('wbc', '7.2 x10³/µL');
        results.set('rbc', '4.8 x10⁶/µL');
        results.set('hemoglobin', '14.5 g/dL');
        results.set('hematocrit', '43%');
        results.set('platelets', '280 x10³/µL');
      } else if (testType.toLowerCase().includes('urine') || testType.toLowerCase().includes('urinalysis')) {
        results.set('color', 'Yellow');
        results.set('clarity', 'Clear');
        results.set('specific_gravity', '1.018');
        results.set('protein', 'Negative');
        results.set('glucose', 'Negative');
        results.set('ketones', 'Negative');
      } else if (testType.toLowerCase().includes('chemistry')) {
        results.set('glucose', '95 mg/dL');
        results.set('cholesterol', '180 mg/dL');
        results.set('triglycerides', '120 mg/dL');
      } else {
        // Generic results
        results.set('status', 'Test completed');
        results.set('result', 'Within normal limits');
      }

      results.set('collected_date', (appointment.appointmentDate || appointment.createdAt).toISOString());
      results.set('completed_date', (appointment.checkedOutAt || appointment.updatedAt).toISOString());
      results.set('technician', `${defaultUser.firstName} ${defaultUser.lastName}`);

      testResultData.results = results;

      try {
        // Create the test result
        const testResult = new TestResult(testResultData);
        await testResult.save();

        console.log(`✅ Created test result ${testResult.sampleId} for ${appointment.patientName} (${testType})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating test result for appointment ${appointment.appointmentId}:`, error.message);
      }
    }

    console.log('\n🎉 Test result generation completed!');
    console.log(`📊 Summary:`);
    console.log(`- Created: ${createdCount} new test results`);
    console.log(`- Skipped: ${skippedCount} existing test results`);
    console.log(`- Total completed appointments: ${completedAppointments.length}`);

  } catch (error) {
    console.error('❌ Error generating test results:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateMissingTestResults();