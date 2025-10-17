const fetch = require('node-fetch');

async function testAppointmentCreation() {
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'receptionist@mdlab.com',
        password: 'receptionist123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? 'Success' : 'Failed');
    
    if (!loginData.success) {
      console.log('Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data?.token || loginData.token;
    console.log('Token obtained:', token ? 'Yes' : 'No');
    console.log('Login data structure:', Object.keys(loginData));
    
    // Create appointment with age and sex
    const appointmentData = {
      patientName: 'Test Patient Debug',
      contactNumber: '1234567890',
      email: 'test@debug.com',
      age: 28,
      sex: 'Male',
      serviceIds: ['68e8f9f78c0dab521aeb1be7'], // Chem 10
      serviceName: 'Chem 10',
      appointmentDate: '2024-12-20',
      appointmentTime: '10:00 AM',
      type: 'walk-in',
      notes: 'Debug test appointment'
    };
    
    console.log('Sending appointment data:', appointmentData);
    
    const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const appointmentResult = await appointmentResponse.json();
    console.log('Appointment creation response:', appointmentResult);
    
    if (appointmentResult.success) {
      console.log('✅ Appointment created successfully!');
      console.log('Age in response:', appointmentResult.data.age);
      console.log('Sex in response:', appointmentResult.data.sex);
    } else {
      console.log('❌ Appointment creation failed:', appointmentResult.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAppointmentCreation();