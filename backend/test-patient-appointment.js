const fetch = require('node-fetch');

async function testAppointmentScenario(appointmentData, token, scenarioName) {
  try {
    console.log(`Sending ${scenarioName} appointment data:`, appointmentData);
    
    const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const appointmentResult = await appointmentResponse.json();
    console.log(`${scenarioName} - Response status:`, appointmentResponse.status);
    console.log(`${scenarioName} - Response:`, appointmentResult);
    
    if (appointmentResponse.status === 500) {
      console.log(`❌ 500 Internal Server Error detected in ${scenarioName}!`);
      return true; // Found the issue
    }
    
    return false;
  } catch (error) {
    console.error(`${scenarioName} test error:`, error.message);
    return false;
  }
}

async function testPatientAppointment() {
  try {
    console.log('🧪 Testing Patient Appointment Creation\n');
    
    // First, login as a patient
    console.log('1. Logging in as patient...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'patient@test.com', // You may need to adjust this
        password: 'patient123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('❌ Patient login failed. Let me try a different approach...');
      
      // Let's try to create a patient appointment using a test patient user
      // For now, let me create the appointment request that the frontend would send
      console.log('2. Testing patient appointment request directly...');
      
      // First login as receptionist to get a token 
      const receptLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: 'receptionist@mdlab.com',
          password: 'receptionist123'
        })
      });
      
      const receptLoginData = await receptLoginResponse.json();
      const token = receptLoginData.token;
      
      // Now create an appointment with patient-like data
      // Test different scenarios that might cause 500 error
      console.log('Testing scenario 1: Invalid patient ID');
      let patientAppointmentData = {
        patientId: '68c6afe6a90477e0edc02c70', // Invalid patient ID
        patientName: 'Test Patient User',
        contactNumber: '09123456789',
        email: 'testpatient@example.com',
        address: '456 Patient Street, Patient City',
        age: 25,
        sex: 'Male',
        serviceIds: ['68e8f9f78c0dab521aeb1be7'],
        serviceName: 'Chem 10',
        appointmentDate: '2024-12-22',
        appointmentTime: 'Any time during clinic hours',
        type: 'scheduled',
        priority: 'regular',
        totalPrice: 1950,
        notes: 'Patient self-booking test',
        reasonForVisit: 'Self-booking test appointment'
      };
      
      await testAppointmentScenario(patientAppointmentData, token, 'Invalid Patient ID');
      
      console.log('\nTesting scenario 2: Invalid service ID');
      patientAppointmentData = {
        patientId: null,
        patientName: 'Test Patient User',
        contactNumber: '09123456789',
        email: 'testpatient@example.com',
        address: '456 Patient Street, Patient City',
        age: 25,
        sex: 'Male',
        serviceIds: ['invalid-service-id'],
        serviceName: 'Invalid Service',
        appointmentDate: '2024-12-22',
        appointmentTime: 'Any time during clinic hours',
        type: 'scheduled',
        priority: 'regular',
        totalPrice: 1950,
        notes: 'Patient self-booking test',
        reasonForVisit: 'Self-booking test appointment'
      };
      
      await testAppointmentScenario(patientAppointmentData, token, 'Invalid Service ID');
      
      console.log('\nTesting scenario 3: Missing required fields');
      patientAppointmentData = {
        patientId: null,
        // patientName: missing!
        contactNumber: '09123456789',
        email: 'testpatient@example.com',
        serviceIds: ['68e8f9f78c0dab521aeb1be7'],
        serviceName: 'Chem 10',
        appointmentDate: '2024-12-22',
        appointmentTime: 'Any time during clinic hours',
        type: 'scheduled',
        priority: 'regular',
        totalPrice: 1950
      };
      
      await testAppointmentScenario(patientAppointmentData, token, 'Missing Required Fields');
      
      console.log('Sending patient appointment data:', patientAppointmentData);
      
      const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientAppointmentData)
      });
      
      const appointmentResult = await appointmentResponse.json();
      console.log('Appointment response status:', appointmentResponse.status);
      console.log('Appointment response:', appointmentResult);
      
      if (appointmentResponse.status === 500) {
        console.log('❌ 500 Internal Server Error detected!');
        console.log('This is the same error the patient dashboard is experiencing.');
      }
      
      return;
    }
    
    // If patient login worked, continue...
    const token = loginData.token;
    console.log('✅ Patient login successful\n');
    
    // Create patient appointment
    console.log('2. Creating patient appointment...');
    // ... rest of patient appointment logic
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testPatientAppointment();