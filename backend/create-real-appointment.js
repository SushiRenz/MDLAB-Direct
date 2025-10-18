const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
const TestResult = require('./models/TestResult');

async function createRealAppointment() {
  try {
    console.log('📋 Creating a real appointment with test results...');
    
    // Find the services
    const services = await Service.find({
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
          price: 250
        },
        {
          serviceName: 'Blood Typing (ABO Rh)',
          description: 'Determination of ABO blood group and Rh factor.',
          category: 'hematology',
          price: 150
        },
        {
          serviceName: 'ESR (Erythrocyte Sedimentation Rate)',
          description: 'Test to detect inflammation in the body.',
          category: 'hematology',
          price: 100
        }
      ];
      
      for (const serviceData of servicesToCreate) {
        const existingService = await Service.findOne({ serviceName: serviceData.serviceName });
        if (!existingService) {
          await Service.create(serviceData);
          console.log('✅ Created service:', serviceData.serviceName);
        }
      }
      
      // Re-fetch services
      const newServices = await Service.find({
        serviceName: {
          $in: ['Complete Blood Count (CBC)', 'Blood Typing (ABO Rh)', 'ESR (Erythrocyte Sedimentation Rate)']
        }
      });
      services.push(...newServices);
    }
    
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
    
    // Create test results with actual values
    const testResult = await TestResult.create({
      appointmentId: appointment.appointmentId,
      appointment: appointment._id,
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
      
      // Blood typing
      bloodType: 'O',
      rhFactor: 'Positive',
      
      // ESR
      esr: 12
    });
    
    console.log('✅ Created test result with actual values');
    console.log('Test Result ID:', testResult._id);
    
    console.log('\n🎉 Successfully created real appointment and test result!');
    console.log('Appointment ID:', appointment.appointmentId);
    console.log('Patient:', appointment.patientName);
    console.log('Services:', services.map(s => s.serviceName).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRealAppointment();