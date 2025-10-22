const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testNewUserCreation() {
  console.log('🧪 Testing new user creation with Patient ID and Address requirements...\n');
  
  try {
    // Test 1: Create patient with string address
    console.log('🔸 Test 1: Create patient with string address');
    const patientData = {
      username: `testpatient_${Date.now()}`,
      email: `testpatient_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'Patient',
      phone: '+639123456789',
      address: 'Simple string address for patient',
      role: 'patient'
    };
    
    const patientResponse = await axios.post(`${API_BASE}/auth/register`, patientData);
    console.log('✅ Patient registration successful!');
    console.log(`Patient ID: ${patientResponse.data.user.patientId}`);
    console.log(`Address: ${patientResponse.data.user.formattedAddress}`);
    console.log(`Role: ${patientResponse.data.user.role}\n`);
    
    // Test 2: Create medtech with string address
    console.log('🔸 Test 2: Create medtech with string address');
    const medtechData = {
      username: `testmedtech_${Date.now()}`,
      email: `testmedtech_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'Medtech',
      phone: '+639123456788',
      address: 'Simple string address for medtech',
      role: 'medtech'
    };
    
    const medtechResponse = await axios.post(`${API_BASE}/auth/register`, medtechData);
    console.log('✅ Medtech registration successful!');
    console.log(`Patient ID: ${medtechResponse.data.user.patientId}`);
    console.log(`Address: ${medtechResponse.data.user.formattedAddress}`);
    console.log(`Role: ${medtechResponse.data.user.role}\n`);
    
    // Test 3: Create admin without address (should fail if address becomes required)
    console.log('🔸 Test 3: Create admin without address');
    const adminData = {
      username: `testadmin_${Date.now()}`,
      email: `testadmin_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'Admin',
      phone: '+639123456787',
      role: 'admin'
      // No address provided
    };
    
    try {
      const adminResponse = await axios.post(`${API_BASE}/auth/register`, adminData);
      console.log('✅ Admin registration successful!');
      console.log(`Patient ID: ${adminResponse.data.user.patientId}`);
      console.log(`Address: ${adminResponse.data.user.formattedAddress || 'No address'}`);
      console.log(`Role: ${adminResponse.data.user.role}\n`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('❌ Admin registration failed (as expected if address is required)');
        console.log(`Error: ${error.response.data.message || error.response.data.error}\n`);
      } else {
        throw error;
      }
    }
    
    // Test 4: Create user with object address (backward compatibility)
    console.log('🔸 Test 4: Create user with object address (backward compatibility)');
    const objectAddressData = {
      username: `testobject_${Date.now()}`,
      email: `testobject_${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'Object',
      phone: '+639123456786',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        zipCode: '1234'
      },
      role: 'patient'
    };
    
    const objectResponse = await axios.post(`${API_BASE}/auth/register`, objectAddressData);
    console.log('✅ Object address registration successful!');
    console.log(`Patient ID: ${objectResponse.data.user.patientId}`);
    console.log(`Address: ${objectResponse.data.user.formattedAddress}`);
    console.log(`Role: ${objectResponse.data.user.role}\n`);
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNewUserCreation();