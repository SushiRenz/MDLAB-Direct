const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const TestResult = require('./models/TestResult');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');

async function testAPILogic() {
  try {
    console.log('🔍 Testing API logic for appointment APT-20251017-016...');
    
    // This mimics what the API endpoint does
    const appointmentId = 'APT-20251017-016';
    
    // Get appointment with services
    const appointment = await Appointment.findOne({ appointmentId })
      .populate('services');
    
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('📋 Appointment found:', appointment.patientName);
    console.log('📋 Services:', appointment.services.map(s => s.serviceName));
    
    // Get test results
    const testResults = await TestResult.findOne({ appointmentId })
      .populate('service')
      .populate('appointment');
    
    if (!testResults) {
      console.log('❌ Test results not found');
      process.exit(1);
    }
    
    console.log('🧪 Test results found:', testResults._id);
    console.log('🧪 Status:', testResults.status);
    console.log('🧪 Results map:', Object.fromEntries(testResults.results));
    
    // This is what should be returned to the frontend
    const response = {
      testResults: testResults,
      services: appointment.services
    };
    
    console.log('\n📤 API Response structure:');
    console.log('- testResults.results keys:', Array.from(testResults.results.keys()));
    console.log('- testResults.hemoglobin:', testResults.hemoglobin);
    console.log('- testResults.results.get("hemoglobin"):', testResults.results.get('hemoglobin'));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPILogic();