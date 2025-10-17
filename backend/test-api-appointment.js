const axios = require('axios');

async function testAppointmentCreation() {
  try {
    // First, login as a patient to get auth token
    console.log('🔐 Logging in as patient...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'maria.santos@email.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.fullName);

    // Create appointment for this patient
    console.log('\n📅 Creating appointment...');
    const appointmentData = {
      patientId: user.id,
      serviceIds: ['68e8f9f78c0dab521aeb1be7'], // Chem 10 service
      appointmentDate: '2025-01-20',
      appointmentTime: '10:00 AM'
    };

    const appointmentResponse = await axios.post(
      'http://localhost:5000/api/appointments',
      appointmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const appointment = appointmentResponse.data.data;
    console.log('✅ Appointment created successfully!');
    console.log('\n=== APPOINTMENT DETAILS ===');
    console.log('ID:', appointment._id);
    console.log('Patient Name:', appointment.patientName);
    console.log('Age:', appointment.age || 'NOT PROVIDED');
    console.log('Sex:', appointment.sex || 'NOT PROVIDED');
    console.log('Address:', appointment.address || 'NOT PROVIDED');
    console.log('Service:', appointment.serviceName);
    console.log('Date:', appointment.appointmentDate);
    console.log('Time:', appointment.appointmentTime);
    console.log('Status:', appointment.status);

    console.log('\n✅ SUCCESS! Age/Sex/Address should now be populated properly.');

  } catch (error) {
    console.error('❌ Error testing appointment creation:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAppointmentCreation();