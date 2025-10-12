const axios = require('axios');

// Test data mimicking the exact frontend structure
const testAppointmentData = {
  patientId: null,
  patientName: "Test Patient",
  contactNumber: "09123456789",
  email: "test@email.com",
  age: 30,
  sex: "Male",
  serviceIds: [
    "6701b9b57f64cdc1a3b30b98", // Real service IDs - using ones that exist
    "6701b9b57f64cdc1a3b30b99",
    "6701b9b57f64cdc1a3b30b9a",
    "6701b9b57f64cdc1a3b30b9b",
    "6701b9b57f64cdc1a3b30b9c",
    "6701b9b57f64cdc1a3b30b9d",
    "6701b9b57f64cdc1a3b30b9e",
    "6701b9b57f64cdc1a3b30b9f",
    "6701b9b57f64cdc1a3b30ba0",
    "6701b9b57f64cdc1a3b30ba1",
    "6701b9b57f64cdc1a3b30ba2",
    "6701b9b57f64cdc1a3b30ba3",
    "6701b9b57f64cdc1a3b30ba4",
    "6701b9b57f64cdc1a3b30ba5",
    "6701b9b57f64cdc1a3b30ba6",
    "6701b9b57f64cdc1a3b30ba7",
    "6701b9b57f64cdc1a3b30ba8",
    "6701b9b57f64cdc1a3b30ba9",
    "6701b9b57f64cdc1a3b30baa",
    "6701b9b57f64cdc1a3b30bab"
  ],
  serviceName: "Test Service 1, Test Service 2, ... (20 services)",
  appointmentDate: "2025-10-13",
  appointmentTime: "10:00 AM",
  type: "scheduled",
  priority: "regular", 
  notes: "Scheduled by receptionist - 20 tests",
  reasonForVisit: "Laboratory tests - Scheduled by receptionist",
  receptionistNotes: "Scheduled via receptionist portal",
  totalPrice: 5000
};

async function testAPICall() {
  try {
    console.log('🧪 Testing API call with 20 services...');
    console.log('📦 Request data:', JSON.stringify(testAppointmentData, null, 2));
    
    // Make API call (you'll need to provide auth token)
    const response = await axios.post('http://localhost:5000/api/appointments', testAppointmentData, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token here if needed
        // 'Authorization': 'Bearer your_token_here'
      }
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAPICall();