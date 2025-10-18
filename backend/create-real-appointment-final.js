const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
const TestResult = require('./models/TestResult');
const User = require('./models/User');

async function createRealAppointment() {
  try {
    console.log('📋 Creating a real appointment with test results...');
    
    // Get user info for createdBy
    const user = await User.findById('68d20f51795f2703491254af');
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    console.log('Using user:', user.firstName, user.lastName);
    
    // Find the services (they should exist from the earlier seed scripts)
    let services = await Service.find({
      serviceName: {
        $in: ['Complete Blood Count (CBC)', 'Blood Typing (ABO Rh)', 'ESR (Erythrocyte Sedimentation Rate)']
      }
    });
    
    console.log('Found services:', services.map(s => s.serviceName));
    
    if (services.length === 0) {
      console.log('❌ No services found. Using existing services...');
      // Let's just find any hematology services
      services = await Service.find({ category: 'hematology' }).limit(3);
      console.log('Found hematology services:', services.map(s => s.serviceName));
    }
    
    if (services.length === 0) {
      console.error('❌ No services available at all');
      process.exit(1);
    }
    
    const serviceNames = services.map(s => s.serviceName).join(', ');
    
    // Check if appointment already exists
    const existingAppointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' });
    let appointment;
    
    if (existingAppointment) {
      console.log('✅ Appointment already exists:', existingAppointment.appointmentId);
      appointment = existingAppointment;
    } else {
      // Create the appointment
      appointment = await Appointment.create({
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
        serviceName: serviceNames, // Required field
        source: 'APPOINTMENT',
        status: 'completed',
        createdBy: user._id, // Required field
        createdByName: `${user.firstName} ${user.lastName}`, // Required field
        type: 'scheduled'
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
    console.log('Services:', serviceNames);
    
    // Verify the data
    console.log('\n🔍 Verifying created data...');
    const finalAppointment = await Appointment.findOne({ appointmentId: 'APT-20251017-016' }).populate('services');
    const finalTestResult = await TestResult.findOne({ appointmentId: 'APT-20251017-016' });
    
    console.log('Final appointment status:', finalAppointment?.status);
    console.log('Final test result status:', finalTestResult?.status);
    console.log('Test result hemoglobin:', finalTestResult?.hemoglobin);
    console.log('Test result blood type:', finalTestResult?.bloodType);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRealAppointment();