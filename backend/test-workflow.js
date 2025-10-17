const fetch = require('node-fetch');

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete Appointment Workflow\n');
    
    // First, login as receptionist
    console.log('1. Logging in as receptionist...');
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
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Create appointment with address, age, and sex
    console.log('2. Creating appointment with complete patient data...');
    const appointmentData = {
      patientName: 'Test Patient Complete',
      contactNumber: '09123456789',
      email: 'testcomplete@test.com',
      address: '123 Test Street, Test City, Test Province',
      age: 30,
      sex: 'Female',
      serviceIds: ['68e8f9f78c0dab521aeb1bfe', '68e8f9f78c0dab521aeb1bff'], // Hepatitis B and VDRL
      serviceName: 'Hepatitis B Antigen (HbsAg), VDRL (Syphilis)',
      appointmentDate: '2024-12-21',
      appointmentTime: '2:00 PM',
      type: 'walk-in',
      notes: 'Complete workflow test'
    };
    
    const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const appointmentResult = await appointmentResponse.json();
    if (!appointmentResult.success) {
      console.log('❌ Appointment creation failed:', appointmentResult.message);
      if (appointmentResult.errors) {
        console.log('Validation errors:', appointmentResult.errors);
      }
      return;
    }
    
    console.log('✅ Appointment created successfully!');
    console.log('📋 Appointment Details:');
    console.log(`   ID: ${appointmentResult.data.appointmentId}`);
    console.log(`   Patient: ${appointmentResult.data.patientName}`);
    console.log(`   Age: ${appointmentResult.data.age}`);
    console.log(`   Sex: ${appointmentResult.data.sex}`);
    console.log(`   Address: ${appointmentResult.data.address}`);
    console.log(`   Services: ${appointmentResult.data.serviceName}`);
    console.log(`   Status: ${appointmentResult.data.status}\n`);
    
    // Fetch the appointment to verify all data is saved correctly
    console.log('3. Verifying appointment data persistence...');
    const appointmentId = appointmentResult.data._id;
    const fetchResponse = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const fetchResult = await fetchResponse.json();
    if (fetchResult.success) {
      console.log('✅ Appointment data retrieved successfully');
      console.log('📋 Verified Data:');
      console.log(`   Age: ${fetchResult.data.age} (type: ${typeof fetchResult.data.age})`);
      console.log(`   Sex: ${fetchResult.data.sex} (type: ${typeof fetchResult.data.sex})`);
      console.log(`   Address: ${fetchResult.data.address} (type: ${typeof fetchResult.data.address})`);
      
      // Check if all required fields are present
      const hasAge = fetchResult.data.age !== null && fetchResult.data.age !== undefined;
      const hasSex = fetchResult.data.sex !== null && fetchResult.data.sex !== undefined && fetchResult.data.sex !== '';
      const hasAddress = fetchResult.data.address !== null && fetchResult.data.address !== undefined && fetchResult.data.address !== '';
      
      console.log('\n📊 Field Validation:');
      console.log(`   Age present: ${hasAge ? '✅' : '❌'}`);
      console.log(`   Sex present: ${hasSex ? '✅' : '❌'}`);
      console.log(`   Address present: ${hasAddress ? '✅' : '❌'}`);
      
      if (hasAge && hasSex && hasAddress) {
        console.log('\n🎉 All patient data fields are correctly saved!');
      } else {
        console.log('\n⚠️ Some patient data fields are missing');
      }
    } else {
      console.log('❌ Failed to retrieve appointment:', fetchResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCompleteWorkflow();