const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
const TestResult = require('./models/TestResult');

async function createRealAppointment() {
  try {
    console.log('📋 Creating a real appointment with test results...');
    
    // Use the first receptionist as createdBy
    const createdBy = '68d20f51795f2703491254af'; // Maria Santos
    
    // Find the services (they should exist from the earlier seed scripts)
    let services = await Service.find({
      serviceName: {
        $in: ['Complete Blood Count (CBC)', 'Blood Typing (ABO Rh)', 'ESR (Erythrocyte Sedimentation Rate)']
      }
    });
    
    console.log('Found services:', services.map(s => s.serviceName));
    
    if (services.length === 0) {
      console.log('❌ No services found. Creating services first...');
      
      // Create services if they don't exist
      const servicesToCreate = [
        {
          serviceName: 'Complete Blood Count (CBC)',
          description: 'Comprehensive blood test evaluating overall health and detecting blood disorders.',
          category: 'hematology',
          price: 250,
          duration: '30 minutes',
          sampleType: 'Blood',
          preparationInstructions: 'No special preparation required',
          createdBy: createdBy
        },
        {
          serviceName: 'Blood Typing (ABO Rh)',
          description: 'Determination of ABO blood group and Rh factor.',
          category: 'hematology',
          price: 150,
          duration: '15 minutes',
          sampleType: 'Blood',
          preparationInstructions: 'No special preparation required',
          createdBy: createdBy
        },
        {
          serviceName: 'ESR (Erythrocyte Sedimentation Rate)',
          description: 'Test to detect inflammation in the body.',
          category: 'hematology',
          price: 100,
          duration: '60 minutes',
          sampleType: 'Blood',
          preparationInstructions: 'No special preparation required',
          createdBy: createdBy
        }
      ];
      
      for (const serviceData of servicesToCreate) {
        const existingService = await Service.findOne({ serviceName: serviceData.serviceName });
        if (!existingService) {
          const newService = await Service.create(serviceData);
          services.push(newService);
          console.log('✅ Created service:', serviceData.serviceName);
        }
      }
    }
    
    if (services.length === 0) {
      console.error('❌ Still no services available after creation attempt');
      process.exit(1);
    }
    
    // Check if appointment already exists
    const existingAppointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' });
    if (existingAppointment) {
      console.log('✅ Appointment already exists:', existingAppointment.appointmentId);
    } else {
      // Create the appointment
      const appointment = await Appointment.create({
        appointmentId: 'APT-20251017-016',
        patientName: 'Renz Ramos',
        age: 22,
        sex: 'Male',
        address: 'Bayombong Nueva Vizcaya',
        contactNumber: '09496858361',
        email: 'renz09358@gmail.com',
        appointmentDate: new Date('2025-10-17'),
        appointmentTime: 'Any time during clinic hours',
        services: services.map(s => s._id),
        source: 'APPOINTMENT',
        status: 'completed'
      });
      
      console.log('✅ Created appointment:', appointment.appointmentId);
    }
    
    // Check if test results already exist
    const existingTestResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    if (existingTestResult) {
      console.log('✅ Test results already exist for this appointment');
      
      // Update with actual values
      await TestResult.updateOne(
        { appointmentId: 'APT-20251017-016' },
        {
          $set: {
            // Hematology results
            hemoglobin: 14.5,
            hematocrit: 42.3,
            rbc: 4.8,
            plateletCount: 320,
            wbc: 7.2,
            
            // Differential count
            segmenters: 65,
            lymphocytes: 28,
            monocytes: 5,
            eosinophils: 2,
            basophils: 0,
            
            // Blood typing
            bloodType: 'O',
            rhFactor: 'Positive',
            
            // ESR
            esr: 12,
            
            status: 'completed',
            completedDate: new Date()
          }
        }
      );
      
      console.log('✅ Updated test result with actual values');
    } else {
      // Create test results with actual values
      const testResult = await TestResult.create({
        appointmentId: 'APT-20251017-016',
        appointment: existingAppointment ? existingAppointment._id : undefined,
        completedDate: new Date(),
        status: 'completed',
        
        // Hematology results
        hemoglobin: 14.5,
        hematocrit: 42.3,
        rbc: 4.8,
        plateletCount: 320,
        wbc: 7.2,
        
        // Differential count
        segmenters: 65,
        lymphocytes: 28,
        monocytes: 5,
        eosinophils: 2,
        basophils: 0,
        
        // Blood typing
        bloodType: 'O',
        rhFactor: 'Positive',
        
        // ESR
        esr: 12
      });
      
      console.log('✅ Created test result with actual values');
      console.log('Test Result ID:', testResult._id);
    }
    
    console.log('\n🎉 Successfully created/updated real appointment and test result!');
    console.log('Appointment ID: APT-20251017-016');
    console.log('Patient: Renz Ramos');
    console.log('Services:', services.map(s => s.serviceName).join(', '));
    
    // Verify the data
    console.log('\n🔍 Verifying created data...');
    const finalAppointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' }).populate('services');
    const finalTestResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    console.log('Final appointment status:', finalAppointment?.status);
    console.log('Final test result status:', finalTestResult?.status);
    console.log('Test result hemoglobin:', finalTestResult?.hemoglobin);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRealAppointment();