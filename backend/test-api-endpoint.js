const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

async function testAPIEndpoint() {
  try {
    console.log('🔍 Testing what API endpoint would return...');
    
    // This mimics the getTestResultsByAppointment function
    const appointmentIdParam = 'APT-20251017-016'; // What frontend sends
    
    // First, the current API tries this (which won't work):
    console.log('❌ Current API approach (should fail):');
    const directResults = await TestResult.find({
      appointment: appointmentIdParam, // String vs ObjectId mismatch
      isDeleted: false
    });
    console.log('Direct results:', directResults.length);
    
    // But we need to find appointment first, then use its ObjectId:
    console.log('\n✅ Correct approach:');
    const appointment = await Appointment.findOne({ appointmentId: appointmentIdParam });
    
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('📋 Found appointment ObjectId:', appointment._id);
    
    // Now find test results using the ObjectId
    const testResults = await TestResult.find({
      appointment: appointment._id,
      isDeleted: false
    })
      .populate('service', 'serviceName category price description')
      .populate({
        path: 'appointment',
        select: 'appointmentId appointmentDate appointmentTime patientName age sex address contactNumber email status serviceName services',
        populate: {
          path: 'services',
          select: 'serviceName category description'
        }
      });
    
    console.log('✅ Found test results:', testResults.length);
    
    if (testResults.length > 0) {
      const testResult = testResults[0];
      console.log('\n📊 Test Result Data:');
      console.log('- ID:', testResult._id);
      console.log('- Status:', testResult.status);
      console.log('- Patient:', testResult.patient);
      console.log('- Results available:', Array.from(testResult.results.keys()));
      console.log('- Sample values:');
      console.log('  * Hemoglobin:', testResult.results.get('hemoglobin'));
      console.log('  * Blood Type:', testResult.results.get('bloodType'));
      console.log('  * RBC:', testResult.results.get('rbc'));
      
      console.log('\n📋 Appointment Data:');
      console.log('- Patient Name:', testResult.appointment.patientName);
      console.log('- Services:', testResult.appointment.services.map(s => s.serviceName));
      
      // This is what should be returned to frontend
      const apiResponse = {
        testResults: testResult,
        services: testResult.appointment.services
      };
      
      console.log('\n🚀 API Response structure is ready!');
      console.log('testResults.results keys:', Array.from(testResult.results.keys()));
      console.log('services:', apiResponse.services.map(s => s.serviceName));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPIEndpoint();