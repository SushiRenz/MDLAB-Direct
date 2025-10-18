const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
const TestResult = require('./models/TestResult');
const User = require('./models/User');

async function createDebugTestData() {
  try {
    console.log('🧪 DEBUGGER: Creating comprehensive test data for Review Results debugging...');
    
    // Get a user for createdBy
    const user = await User.findOne({ role: 'receptionist' });
    if (!user) {
      console.error('❌ No receptionist user found');
      process.exit(1);
    }
    
    console.log('👤 Using user:', user.firstName, user.lastName);
    
    // Create test services if they don't exist
    const testServices = [
      {
        serviceName: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood test evaluating overall health and detecting blood disorders.',
        category: 'hematology',
        price: 250,
        duration: '30 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'No special preparation required',
        createdBy: user._id
      },
      {
        serviceName: 'Blood Typing (ABO Rh)',
        description: 'Determination of ABO blood group and Rh factor.',
        category: 'hematology',
        price: 150,
        duration: '15 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'No special preparation required',
        createdBy: user._id
      },
      {
        serviceName: 'FBS (Fasting Blood Sugar)',
        description: 'Measurement of glucose levels after fasting.',
        category: 'clinical_chemistry',
        price: 200,
        duration: '20 minutes',
        sampleType: 'Blood',
        preparationInstructions: '8-12 hours fasting required',
        createdBy: user._id
      },
      {
        serviceName: 'Urinalysis',
        description: 'Complete urine examination.',
        category: 'clinical_microscopy',
        price: 180,
        duration: '25 minutes',
        sampleType: 'Urine',
        preparationInstructions: 'Collect clean-catch midstream urine',
        createdBy: user._id
      },
      {
        serviceName: 'HBsAg (Hepatitis B Surface Antigen)',
        description: 'Test for Hepatitis B infection.',
        category: 'serology_immunology',
        price: 300,
        duration: '30 minutes',
        sampleType: 'Blood',
        preparationInstructions: 'No special preparation required',
        createdBy: user._id
      }
    ];
    
    console.log('🏷️ Creating/finding services...');
    const createdServices = [];
    
    for (const serviceData of testServices) {
      let service = await Service.findOne({ serviceName: serviceData.serviceName });
      if (!service) {
        service = await Service.create(serviceData);
        console.log('✅ Created service:', serviceData.serviceName);
      } else {
        console.log('📋 Found existing service:', serviceData.serviceName);
      }
      createdServices.push(service);
    }
    
    // Create test appointments with different service combinations
    const testAppointments = [
      {
        appointmentId: 'APT-HEMATOLOGY-001',
        patientName: 'Alice Johnson',
        age: 28,
        sex: 'Female',
        address: 'Manila, Philippines',
        contactNumber: '09171234567',
        email: 'alice.johnson@email.com',
        services: [createdServices[0], createdServices[1]], // CBC + Blood Typing
        testResults: {
          hemoglobin: '135',
          hematocrit: '41.2',
          rbc: '4.5',
          wbc: '6.8',
          plateletCount: '280',
          bloodType: 'A',
          rhFactor: 'Positive',
          segmenters: '62',
          lymphocytes: '30',
          monocytes: '6',
          eosinophils: '2',
          basophils: '0'
        }
      },
      {
        appointmentId: 'APT-CHEMISTRY-001',
        patientName: 'Bob Martinez',
        age: 45,
        sex: 'Male',
        address: 'Quezon City, Philippines',
        contactNumber: '09187654321',
        email: 'bob.martinez@email.com',
        services: [createdServices[2]], // FBS
        testResults: {
          fbs: '95',
          glucose: '95'
        }
      },
      {
        appointmentId: 'APT-MICROSCOPY-001',
        patientName: 'Carol Santos',
        age: 32,
        sex: 'Female',
        address: 'Makati, Philippines',
        contactNumber: '09198765432',
        email: 'carol.santos@email.com',
        services: [createdServices[3]], // Urinalysis
        testResults: {
          color: 'Yellow',
          clarity: 'Clear',
          specific_gravity: '1.020',
          protein: 'Negative',
          glucose: 'Negative',
          ketones: 'Negative',
          urobilinogen: 'Normal',
          bilirubin: 'Negative',
          blood: 'Negative',
          leukocyte_esterase: 'Negative',
          nitrites: 'Negative'
        }
      },
      {
        appointmentId: 'APT-SEROLOGY-001',
        patientName: 'David Cruz',
        age: 38,
        sex: 'Male',
        address: 'Cebu City, Philippines',
        contactNumber: '09209876543',
        email: 'david.cruz@email.com',
        services: [createdServices[4]], // HBsAg
        testResults: {
          hbsag: 'Non-Reactive',
          hepatitis_b: 'Non-Reactive'
        }
      },
      {
        appointmentId: 'APT-COMBINED-001',
        patientName: 'Eva Rodriguez',
        age: 26,
        sex: 'Female',
        address: 'Davao City, Philippines',
        contactNumber: '09210987654',
        email: 'eva.rodriguez@email.com',
        services: [createdServices[0], createdServices[2], createdServices[3]], // CBC + FBS + Urinalysis
        testResults: {
          // Hematology
          hemoglobin: '128',
          hematocrit: '38.5',
          rbc: '4.2',
          wbc: '7.5',
          plateletCount: '320',
          segmenters: '65',
          lymphocytes: '28',
          monocytes: '5',
          eosinophils: '2',
          basophils: '0',
          // Chemistry
          fbs: '88',
          glucose: '88',
          // Microscopy
          color: 'Pale Yellow',
          clarity: 'Clear',
          specific_gravity: '1.018',
          protein: 'Trace',
          glucose: 'Negative'
        }
      }
    ];
    
    console.log('🏥 Creating test appointments and results...');
    
    for (const appointmentData of testAppointments) {
      // Check if appointment already exists
      const existingAppointment = await Appointment.findOne({ appointmentId: appointmentData.appointmentId });
      
      let appointment;
      if (existingAppointment) {
        console.log('📋 Appointment already exists:', appointmentData.appointmentId);
        appointment = existingAppointment;
      } else {
        // Create appointment
        appointment = await Appointment.create({
          appointmentId: appointmentData.appointmentId,
          patientName: appointmentData.patientName,
          age: appointmentData.age,
          sex: appointmentData.sex,
          address: appointmentData.address,
          contactNumber: appointmentData.contactNumber,
          email: appointmentData.email,
          appointmentDate: new Date(),
          appointmentTime: 'Any time during clinic hours',
          services: appointmentData.services.map(s => s._id),
          serviceName: appointmentData.services.map(s => s.serviceName).join(', '),
          source: 'APPOINTMENT',
          status: 'completed',
          createdBy: user._id,
          createdByName: `${user.firstName} ${user.lastName}`,
          type: 'scheduled'
        });
        
        console.log('✅ Created appointment:', appointmentData.appointmentId);
      }
      
      // Check if test result already exists
      const existingTestResult = await TestResult.findOne({ appointment: appointment._id });
      
      if (existingTestResult) {
        console.log('📊 Test result already exists for:', appointmentData.appointmentId);
        
        // Update with new values
        await TestResult.updateOne(
          { appointment: appointment._id },
          {
            $set: {
              results: new Map(Object.entries(appointmentData.testResults)),
              status: 'completed',
              completedDate: new Date()
            }
          }
        );
        
        console.log('🔄 Updated test result values');
      } else {
        // Create test result
        const testResult = await TestResult.create({
          patient: `walk-in-${appointmentData.appointmentId}`,
          isWalkInPatient: true,
          patientInfo: {
            name: appointmentData.patientName,
            age: appointmentData.age,
            gender: appointmentData.sex,
            contactNumber: appointmentData.contactNumber,
            address: appointmentData.address
          },
          appointment: appointment._id,
          service: appointmentData.services[0]._id, // Use first service
          testType: 'Laboratory Test',
          results: new Map(Object.entries(appointmentData.testResults)),
          status: 'completed',
          completedDate: new Date(),
          createdBy: user._id,
          sampleDate: new Date()
        });
        
        console.log('✅ Created test result for:', appointmentData.appointmentId);
      }
    }
    
    console.log('\n🎉 Debug test data creation completed!');
    console.log('📋 Created appointments with different service types:');
    console.log('  - APT-HEMATOLOGY-001: Alice Johnson (CBC + Blood Typing)');
    console.log('  - APT-CHEMISTRY-001: Bob Martinez (FBS)');
    console.log('  - APT-MICROSCOPY-001: Carol Santos (Urinalysis)');
    console.log('  - APT-SEROLOGY-001: David Cruz (HBsAg)');
    console.log('  - APT-COMBINED-001: Eva Rodriguez (CBC + FBS + Urinalysis)');
    console.log('\n🔍 Each appointment has completed test results with actual values.');
    console.log('💡 Refresh your Review Results page to see all these test appointments!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating debug test data:', error);
    process.exit(1);
  }
}

createDebugTestData();