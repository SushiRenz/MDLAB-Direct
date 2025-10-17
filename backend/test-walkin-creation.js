const axios = require('axios');

async function testWalkInAppointment() {
  try {
    console.log('🔐 Testing walk-in appointment creation...');
    
    // Login as receptionist first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'receptionist@mdlab.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful as:', user.fullName || user.username);

    // Create walk-in appointment with complete data
    const walkInData = {
      patientId: null, // Walk-in appointment
      patientName: 'Test Walk-In Patient',
      contactNumber: '+639123456789',
      email: 'walkin@test.com',
      address: '123 Walk-In Street, Test City, Test Province',
      age: 35,
      sex: 'Female',
      serviceIds: ['68e8f9f78c0dab521aeb1be7'], // Use a known service ID
      appointmentDate: '2025-01-22',
      appointmentTime: '3:00 PM',
      type: 'walk-in'
    };

    console.log('\n📅 Creating walk-in appointment with data:');
    console.log('Name:', walkInData.patientName);
    console.log('Age:', walkInData.age);
    console.log('Sex:', walkInData.sex);
    console.log('Address:', walkInData.address);

    const response = await axios.post(
      'http://localhost:5000/api/appointments',
      walkInData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const appointment = response.data.data;
    console.log('\n✅ Walk-in appointment created successfully!');
    console.log('\n=== VERIFICATION ===');
    console.log('Patient Name:', appointment.patientName);
    console.log('Age:', appointment.age || '❌ MISSING');
    console.log('Sex:', appointment.sex || '❌ MISSING');
    console.log('Address:', appointment.address || '❌ MISSING');
    console.log('Service:', appointment.serviceName);
    console.log('Type:', appointment.type);
    console.log('Status:', appointment.status);

    if (appointment.age && appointment.sex && appointment.address) {
      console.log('\n🎉 SUCCESS! Walk-in appointment has complete age/sex/address data.');
    } else {
      console.log('\n❌ ISSUE: Walk-in appointment is missing some data.');
    }

  } catch (error) {
    console.error('❌ Error testing walk-in appointment:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testWalkInAppointment();