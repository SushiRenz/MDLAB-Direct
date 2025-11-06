// Debug script to test appointment creation directly
const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.112:5000/api';

async function testAppointmentCreation() {
  try {
    console.log('🧪 Testing Appointment Creation...');
    
    // Test appointment data
    const testAppointmentData = {
      patientId: "test-patient-id",
      patientName: "Test Patient",
      contactNumber: "09123456789",
      email: "test@example.com",
      address: "Test Address",
      age: 25,
      sex: "male",
      serviceIds: ["68f35fbe3e6cb7a86a6dd68a"], // PT test ID
      serviceName: "PT (Prothrombin Time)",
      appointmentDate: new Date().toISOString(),
      appointmentTime: "Any time during clinic hours",
      type: "clinic",
      totalPrice: 200,
      notes: "Tests: PT (Prothrombin Time)",
      createdBy: "test-patient-id",
      createdByName: "Test Patient"
    };
    
    console.log('📝 Sending appointment data:');
    console.log(JSON.stringify(testAppointmentData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/appointments`, testAppointmentData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating appointment:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testGetAppointments() {
  try {
    console.log('\n🔍 Testing Get Appointments...');
    
    const response = await axios.get(`${API_BASE_URL}/appointments?patientId=test-patient-id`, {
      timeout: 10000
    });
    
    console.log('✅ Get Appointments Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting appointments:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
async function runTests() {
  await testAppointmentCreation();
  
  // Wait a moment then test retrieval
  setTimeout(async () => {
    await testGetAppointments();
  }, 2000);
}

runTests();