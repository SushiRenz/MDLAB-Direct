const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');
const User = require('./models/User');
const Service = require('./models/Service');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixExistingTestResults() {
  try {
    console.log('🔄 Fixing existing test results for completed appointments...');

    // Find all completed appointments
    const completedAppointments = await Appointment.find({ 
      status: 'completed' 
    }).populate('services');

    console.log(`📋 Found ${completedAppointments.length} completed appointments`);

    // Get a system user for creating test results
    const systemUser = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (!systemUser) {
      console.error('❌ No user found to use for test result creation');
      return;
    }

    for (let appointment of completedAppointments) {
      // Check if test result already exists
      const existingResult = await TestResult.findOne({ 
        appointment: appointment._id 
      });

      if (existingResult) {
        console.log(`✅ Test result already exists for appointment ${appointment.appointmentId}`);
        
        // Update existing test result to include service-based fields
        await updateTestResultWithServiceFields(existingResult, appointment);
        continue;
      }

      // Create new test result for this appointment
      console.log(`🆕 Creating test result for appointment ${appointment.appointmentId}`);
      await createTestResultForAppointment(appointment, systemUser);
    }

    console.log('✅ Finished fixing existing test results');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing test results:', error);
    process.exit(1);
  }
}

async function updateTestResultWithServiceFields(testResult, appointment) {
  try {
    const selectedServices = appointment.services || [];
    if (selectedServices.length === 0) return;

    // Group services by category
    const servicesByCategory = {};
    selectedServices.forEach(service => {
      const category = service.category || 'general';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // Get existing results
    const results = testResult.results instanceof Map ? testResult.results : new Map(Object.entries(testResult.results || {}));

    // Add fields based on service categories
    Object.keys(servicesByCategory).forEach(category => {
      const services = servicesByCategory[category];
      
      switch (category.toLowerCase()) {
        case 'clinical_chemistry':
        case 'chemistry':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('glucose') || serviceName.includes('fbs')) {
              if (!results.has('fbs')) results.set('fbs', 'Pending');
            }
            if (serviceName.includes('cholesterol')) {
              if (!results.has('cholesterol')) results.set('cholesterol', 'Pending');
            }
            if (serviceName.includes('triglyceride')) {
              if (!results.has('triglyceride')) results.set('triglyceride', 'Pending');
            }
            if (serviceName.includes('creatinine')) {
              if (!results.has('creatinine')) results.set('creatinine', 'Pending');
            }
            if (serviceName.includes('bun')) {
              if (!results.has('bun')) results.set('bun', 'Pending');
            }
          });
          break;

        case 'hematology':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('cbc') || serviceName.includes('blood count')) {
              if (!results.has('wbc')) results.set('wbc', 'Pending');
              if (!results.has('rbc')) results.set('rbc', 'Pending');
              if (!results.has('hemoglobin')) results.set('hemoglobin', 'Pending');
              if (!results.has('hematocrit')) results.set('hematocrit', 'Pending');
              if (!results.has('platelets')) results.set('platelets', 'Pending');
              if (!results.has('lymphocytes')) results.set('lymphocytes', 'Pending');
            }
          });
          break;

        case 'clinical_microscopy':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('pregnancy')) {
              if (!results.has('pregnancy_test')) results.set('pregnancy_test', 'Pending');
            }
            if (serviceName.includes('urine') || serviceName.includes('urinalysis')) {
              if (!results.has('urine_color')) results.set('urine_color', 'Pending');
              if (!results.has('urine_transparency')) results.set('urine_transparency', 'Pending');
              if (!results.has('urine_ph')) results.set('urine_ph', 'Pending');
              if (!results.has('urine_specific_gravity')) results.set('urine_specific_gravity', 'Pending');
            }
          });
          break;

        case 'serology_immunology':
        case 'serology':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('dengue')) {
              if (!results.has('dengue_ns1')) results.set('dengue_ns1', 'Pending');
              if (serviceName.includes('igg') || serviceName.includes('duo')) {
                if (!results.has('dengue_igg')) results.set('dengue_igg', 'Pending');
              }
              if (serviceName.includes('igm') || serviceName.includes('duo')) {
                if (!results.has('dengue_igm')) results.set('dengue_igm', 'Pending');
              }
            }
            if (serviceName.includes('hepatitis') || serviceName.includes('hbsag')) {
              if (!results.has('hbsag')) results.set('hbsag', 'Pending');
            }
            if (serviceName.includes('hiv')) {
              if (!results.has('hiv')) results.set('hiv', 'Pending');
            }
            if (serviceName.includes('vdrl')) {
              if (!results.has('vdrl')) results.set('vdrl', 'Pending');
            }
          });
          break;
      }
    });

    // Update the test result
    testResult.results = results;
    testResult.status = 'completed'; // Mark as completed since appointment is already completed
    await testResult.save();

    console.log(`🔄 Updated test result for appointment ${appointment.appointmentId} with service-based fields`);
  } catch (error) {
    console.error(`❌ Error updating test result for appointment ${appointment.appointmentId}:`, error);
  }
}

async function createTestResultForAppointment(appointment, currentUser) {
  try {
    const selectedServices = appointment.services || [];
    if (selectedServices.length === 0) return null;

    // Group services by category
    const servicesByCategory = {};
    selectedServices.forEach(service => {
      const category = service.category || 'general';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // Create test results based on selected services and categories
    const results = new Map();
    
    // Add basic metadata
    results.set('collection_date', new Date().toISOString());
    results.set('collected_by', currentUser.firstName + ' ' + currentUser.lastName);
    results.set('status', 'Sample collected - completed');

    // Generate test fields based on selected service categories (same logic as in appointmentController)
    Object.keys(servicesByCategory).forEach(category => {
      const services = servicesByCategory[category];
      
      switch (category.toLowerCase()) {
        case 'clinical_chemistry':
        case 'chemistry':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('glucose') || serviceName.includes('fbs')) {
              results.set('fbs', 'Pending');
            }
            if (serviceName.includes('cholesterol')) {
              results.set('cholesterol', 'Pending');
            }
            if (serviceName.includes('triglyceride')) {
              results.set('triglyceride', 'Pending');
            }
            if (serviceName.includes('creatinine')) {
              results.set('creatinine', 'Pending');
            }
            if (serviceName.includes('bun')) {
              results.set('bun', 'Pending');
            }
          });
          break;

        case 'hematology':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('cbc') || serviceName.includes('blood count')) {
              results.set('wbc', 'Pending');
              results.set('rbc', 'Pending');
              results.set('hemoglobin', 'Pending');
              results.set('hematocrit', 'Pending');
              results.set('platelets', 'Pending');
              results.set('lymphocytes', 'Pending');
            }
          });
          break;

        case 'clinical_microscopy':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('pregnancy')) {
              results.set('pregnancy_test', 'Pending');
            }
            if (serviceName.includes('urine') || serviceName.includes('urinalysis')) {
              results.set('urine_color', 'Pending');
              results.set('urine_transparency', 'Pending');
              results.set('urine_ph', 'Pending');
              results.set('urine_specific_gravity', 'Pending');
            }
          });
          break;

        case 'serology_immunology':
        case 'serology':
          services.forEach(service => {
            const serviceName = service.serviceName.toLowerCase();
            if (serviceName.includes('dengue')) {
              results.set('dengue_ns1', 'Pending');
              if (serviceName.includes('igg') || serviceName.includes('duo')) {
                results.set('dengue_igg', 'Pending');
              }
              if (serviceName.includes('igm') || serviceName.includes('duo')) {
                results.set('dengue_igm', 'Pending');
              }
            }
            if (serviceName.includes('hepatitis') || serviceName.includes('hbsag')) {
              results.set('hbsag', 'Pending');
            }
            if (serviceName.includes('hiv')) {
              results.set('hiv', 'Pending');
            }
            if (serviceName.includes('vdrl')) {
              results.set('vdrl', 'Pending');
            }
          });
          break;
      }
    });

    // Create the test result
    const testResult = new TestResult({
      appointment: appointment._id,
      service: selectedServices[0]._id,
      testType: appointment.serviceName,
      sampleDate: new Date(),
      sampleId: `S${Date.now()}`,
      results: results,
      status: 'completed', // Mark as completed since appointment is already completed
      priority: appointment.priority || 'normal',
      notes: `Auto-generated for completed appointment ${appointment.appointmentId}`,
      createdBy: currentUser._id,
      patientInfo: {
        name: appointment.patientName,
        age: appointment.age,
        gender: appointment.sex,
        address: appointment.address,
        contactNumber: appointment.contactNumber
      }
    });

    await testResult.save();
    console.log(`✅ Created test result for appointment ${appointment.appointmentId}`);
    return testResult;
  } catch (error) {
    console.error(`❌ Error creating test result for appointment ${appointment.appointmentId}:`, error);
  }
}

// Run the fix
fixExistingTestResults();