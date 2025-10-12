const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// First, let's get a valid auth token
async function getAuthToken() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'admin@mdlab.com', // Use identifier instead of email
      password: 'admin123'
    });
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testAppointmentCreation() {
  try {
    console.log('🔑 Getting auth token...');
    const token = await getAuthToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return;
    }
    console.log('✅ Got auth token');

    // Test data with real service IDs
    const appointmentData = {
      patientId: null,
      patientName: "Test Patient",
      contactNumber: "09123456789",
      email: "test@email.com",
      age: 30,
      sex: "Male",
      serviceIds: [
        "68e8f9f78c0dab521aeb1be7",
        "68e8f9f78c0dab521aeb1be8",
        "68e8f9f78c0dab521aeb1be9",
        "68e8f9f78c0dab521aeb1bea",
        "68e8f9f78c0dab521aeb1beb",
        "68e8f9f78c0dab521aeb1bec",
        "68e8f9f78c0dab521aeb1bed",
        "68e8f9f78c0dab521aeb1bee",
        "68e8f9f78c0dab521aeb1bef",
        "68e8f9f78c0dab521aeb1bf0",
        "68e8f9f78c0dab521aeb1bf1",
        "68e8f9f78c0dab521aeb1bf2",
        "68e8f9f78c0dab521aeb1bf3",
        "68e8f9f78c0dab521aeb1bf4",
        "68e8f9f78c0dab521aeb1bf5",
        "68e8f9f78c0dab521aeb1bf6",
        "68e8f9f78c0dab521aeb1bf7",
        "68e8f9f78c0dab521aeb1bf8",
        "68e8f9f78c0dab521aeb1bf9",
        "68e8f9f78c0dab521aeb1bfa"
      ],
      serviceName: "Chem 10, Lipid Profile, Electrolytes, FBS/RBS, Total Cholesterol, Triglycerides, HDL Cholesterol, LDL Cholesterol, Uric Acid, Creatinine, BUN, ALT / SGPT, AST / SGOT, Serum Pregnancy Test, OGTT, HBA1c, Complete Blood Count (CBC), Blood Typing (ABO Rh), ESR, Urinalysis",
      appointmentDate: "2025-10-13",
      appointmentTime: "10:00 AM",
      type: "scheduled",
      priority: "regular",
      notes: "Scheduled by receptionist - 20 tests",
      reasonForVisit: "Laboratory tests - Scheduled by receptionist",
      receptionistNotes: "Scheduled via receptionist portal",
      totalPrice: 9540 // Sum of all the test prices
    };

    console.log('🧪 Testing appointment creation with 20 services...');
    console.log('📦 Request data:', JSON.stringify(appointmentData, null, 2));

    const response = await axios.post('http://localhost:5000/api/appointments', appointmentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Success!');
    console.log('📦 Response:', response.data);

  } catch (error) {
    console.error('❌ Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAppointmentCreation();