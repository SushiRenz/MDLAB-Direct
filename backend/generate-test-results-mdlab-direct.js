const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');
const Service = require('./models/Service');
const User = require('./models/User');

// Connect to the correct database (MDLAB_DIRECT)
mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function generateTestResultsForCompleted() {
  try {
    console.log('🔬 Generating test results for completed appointments in MDLAB_DIRECT...\n');

    // Find all completed appointments
    const completedAppointments = await Appointment.find({ 
      status: 'completed' 
    }).populate('service');

    console.log(`📋 Found ${completedAppointments.length} completed appointments`);

    // Find a default user to use as creator
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

    // Find default service for test results
    let defaultService = await Service.findOne();
    if (!defaultService) {
      console.log('⚠️ No services found, creating a default service...');
      defaultService = new Service({
        serviceName: 'General Lab Test',
        description: 'General laboratory test',
        category: 'clinical_microscopy',
        sampleType: 'Various',
        duration: '2-4 hours',
        price: 200,
        createdBy: defaultUser._id
      });
      await defaultService.save();
      console.log('✅ Created default service');
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const appointment of completedAppointments) {
      console.log(`\n🔍 Processing appointment ${appointment.appointmentId} for ${appointment.patientName}`);

      // Check if test result already exists
      const existingResult = await TestResult.findOne({ 
        appointment: appointment._id 
      });

      if (existingResult) {
        console.log(`⚠️ Test result already exists - skipping`);
        skippedCount++;
        continue;
      }

      // Parse multiple services from serviceName
      const services = appointment.serviceName ? appointment.serviceName.split(',').map(s => s.trim()) : ['General Lab Test'];
      
      // Create test results for each service
      for (let i = 0; i < services.length; i++) {
        const testType = services[i] || 'General Lab Test';
        
        console.log(`  📝 Creating test result for: ${testType}`);

        // Prepare test result data
        const testResultData = {
          appointment: appointment._id,
          service: appointment.service?._id || defaultService._id,
          testType: testType,
          sampleDate: appointment.appointmentDate || appointment.createdAt,
          status: 'completed',
          createdBy: defaultUser._id,
          completedAt: appointment.checkedOutAt || appointment.updatedAt || new Date(),
          notes: `Test result for ${testType} - Appointment ${appointment.appointmentId}`
        };

        // Handle patient data - walk-in patient (since most appointments seem to be walk-ins)
        testResultData.patient = `WALKIN-${appointment.patientName?.replace(/\s+/g, '-').toUpperCase()}-${appointment._id}`;
        testResultData.isWalkInPatient = true;
        testResultData.patientInfo = {
          name: appointment.patientName,
          age: appointment.age,
          gender: appointment.sex,
          address: appointment.address,
          contactNumber: appointment.contactNumber
        };

        // Create appropriate test results based on test type
        const results = new Map();
        
        const testTypeLower = testType.toLowerCase();
        
        if (testTypeLower.includes('blood') || testTypeLower.includes('cbc')) {
          results.set('wbc', '7.8 x10³/µL');
          results.set('rbc', '4.6 x10⁶/µL');
          results.set('hemoglobin', '14.2 g/dL');
          results.set('hematocrit', '42%');
          results.set('platelets', '290 x10³/µL');
          results.set('lymphocytes', '35%');
          results.set('neutrophils', '60%');
        } else if (testTypeLower.includes('urine') || testTypeLower.includes('urinalysis')) {
          results.set('color', 'Light Yellow');
          results.set('clarity', 'Clear');
          results.set('specific_gravity', '1.020');
          results.set('ph', '6.5');
          results.set('protein', 'Negative');
          results.set('glucose', 'Negative');
          results.set('ketones', 'Negative');
          results.set('blood', 'Negative');
          results.set('nitrites', 'Negative');
          results.set('leukocytes', 'Negative');
        } else if (testTypeLower.includes('hepatitis') || testTypeLower.includes('hbsag')) {
          results.set('result', 'Non-Reactive');
          results.set('interpretation', 'Negative for Hepatitis B Surface Antigen');
        } else if (testTypeLower.includes('vdrl') || testTypeLower.includes('syphilis')) {
          results.set('result', 'Non-Reactive');
          results.set('interpretation', 'Negative for Syphilis');
        } else if (testTypeLower.includes('covid') || testTypeLower.includes('antigen')) {
          results.set('result', 'Negative');
          results.set('interpretation', 'Not detected');
        } else if (testTypeLower.includes('typhoid') || testTypeLower.includes('salmonella')) {
          results.set('igg_result', 'Negative');
          results.set('igm_result', 'Negative');
          results.set('interpretation', 'No evidence of recent or past Salmonella infection');
        } else if (testTypeLower.includes('dengue')) {
          results.set('ns1_result', 'Negative');
          results.set('igg_result', 'Negative');
          results.set('igm_result', 'Negative');
          results.set('interpretation', 'No evidence of Dengue infection');
        } else if (testTypeLower.includes('pregnancy')) {
          results.set('result', 'Negative');
          results.set('interpretation', 'Not pregnant');
        } else if (testTypeLower.includes('creatinine')) {
          results.set('creatinine', '1.0 mg/dL');
          results.set('reference_range', '0.6-1.2 mg/dL');
        } else if (testTypeLower.includes('bun')) {
          results.set('bun', '15 mg/dL');
          results.set('reference_range', '8-20 mg/dL');
        } else if (testTypeLower.includes('alt') || testTypeLower.includes('sgpt')) {
          results.set('alt_sgpt', '25 U/L');
          results.set('reference_range', '7-35 U/L');
        } else if (testTypeLower.includes('ast') || testTypeLower.includes('sgot')) {
          results.set('ast_sgot', '22 U/L');
          results.set('reference_range', '8-35 U/L');
        } else if (testTypeLower.includes('psa')) {
          results.set('psa', '1.2 ng/mL');
          results.set('reference_range', '<4.0 ng/mL');
        } else if (testTypeLower.includes('ogtt') || testTypeLower.includes('glucose')) {
          results.set('fasting_glucose', '92 mg/dL');
          results.set('1hr_glucose', '165 mg/dL');
          results.set('2hr_glucose', '140 mg/dL');
          results.set('interpretation', 'Normal glucose tolerance');
        } else if (testTypeLower.includes('chem')) {
          results.set('glucose', '95 mg/dL');
          results.set('bun', '15 mg/dL');
          results.set('creatinine', '1.0 mg/dL');
          results.set('total_protein', '7.2 g/dL');
          results.set('albumin', '4.1 g/dL');
          results.set('total_bilirubin', '0.8 mg/dL');
          results.set('alt_sgpt', '25 U/L');
          results.set('ast_sgot', '22 U/L');
          results.set('alkaline_phosphatase', '85 U/L');
          results.set('ldh', '180 U/L');
        } else {
          // Generic results
          results.set('result', 'Within normal limits');
          results.set('status', 'Test completed successfully');
        }

        // Add common metadata
        results.set('collected_date', (appointment.appointmentDate || appointment.createdAt).toISOString());
        results.set('completed_date', (appointment.checkedOutAt || appointment.updatedAt || new Date()).toISOString());
        results.set('technician', `${defaultUser.firstName} ${defaultUser.lastName}`);
        results.set('remarks', 'Results reviewed and approved');

        testResultData.results = results;

        try {
          // Create the test result
          const testResult = new TestResult(testResultData);
          await testResult.save();

          console.log(`    ✅ Created test result ${testResult.sampleId} for ${testType}`);
          createdCount++;
        } catch (error) {
          console.error(`    ❌ Error creating test result for ${testType}:`, error.message);
        }
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

generateTestResultsForCompleted();