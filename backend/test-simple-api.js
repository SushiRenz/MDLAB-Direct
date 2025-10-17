// Simple test without starting mongoose connection
const axios = require('axios');

async function testAppointmentAPI() {
  try {
    console.log('🔐 Testing appointment creation API...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'maria.santos@email.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful for:', user.fullName);

    // Create appointment
    const appointmentData = {
      patientId: user.id,
      serviceIds: ['68e8f9f78c0dab521aeb1be7'],
      appointmentDate: '2025-01-21',
      appointmentTime: '2:00 PM'
    };

    console.log('\n📅 Creating appointment with data:', appointmentData);

    const response = await axios.post(
      'http://localhost:5000/api/appointments',
      appointmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const appointment = response.data.data;
    console.log('\n✅ Appointment created!');
    console.log('Patient Name:', appointment.patientName);
    console.log('Age:', appointment.age);
    console.log('Sex:', appointment.sex);
    console.log('Address:', appointment.address);
    console.log('Service:', appointment.serviceName);

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testAppointmentAPI();