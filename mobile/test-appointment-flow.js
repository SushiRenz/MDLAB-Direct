#!/usr/bin/env node

/**
 * COMPREHENSIVE MOBILE APP APPOINTMENT TEST
 * 
 * This script simulates the exact API calls that the mobile app makes:
 * 1. Login as patient
 * 2. Fetch appointments
 * 3. Create new appointment
 * 4. Verify it appears in the list
 */

const API_BASE_URL = 'http://192.168.1.112:5000/api';

let authToken = null;
let currentUser = null;

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, useAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`\n🌐 ${method} ${url}`);
  if (data) {
    console.log('   Payload:', JSON.stringify(data, null, 2));
  }
  if (useAuth && authToken) {
    console.log('   Auth: Bearer token present ✓');
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    console.log(`📡 Response (${response.status}):`, JSON.stringify(responseData, null, 2));
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    throw error;
  }
}

// Step 1: Login
async function testLogin() {
  console.log('\n' + '='.repeat(80));
  console.log('STEP 1: LOGIN AS PATIENT');
  console.log('='.repeat(80));
  
  const result = await apiRequest('POST', '/auth/login', {
    identifier: 'patient@test.com',
    password: 'password123'
  }, false);
  
  if (result.data.success && result.data.token) {
    authToken = result.data.token;
    currentUser = result.data.user;
    console.log('\n✅ Login successful!');
    console.log('   User:', currentUser.firstName, currentUser.lastName);
    console.log('   User ID:', currentUser.id || currentUser._id);
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } else {
    console.log('\n❌ Login failed:', result.data.message);
    return false;
  }
}

// Step 2: Fetch existing appointments
async function testFetchAppointments() {
  console.log('\n' + '='.repeat(80));
  console.log('STEP 2: FETCH APPOINTMENTS (Before creating new one)');
  console.log('='.repeat(80));
  
  const result = await apiRequest('GET', '/appointments');
  
  if (result.data.success) {
    const count = result.data.data?.length || 0;
    console.log(`\n✅ Found ${count} appointment(s)`);
    
    if (count > 0) {
      result.data.data.forEach((apt, index) => {
        console.log(`\n   ${index + 1}. ${apt.appointmentId}`);
        console.log('      Patient:', apt.patientName);
        console.log('      Service:', apt.serviceName);
        console.log('      Date:', apt.appointmentDate);
        console.log('      Status:', apt.status);
      });
    }
    
    return count;
  } else {
    console.log('\n❌ Failed to fetch appointments:', result.data.message);
    return 0;
  }
}

// Step 3: Get available services
async function getAvailableServices() {
  console.log('\n' + '='.repeat(80));
  console.log('STEP 3: GET AVAILABLE SERVICES');
  console.log('='.repeat(80));
  
  const result = await apiRequest('GET', '/services?limit=5');
  
  if (result.data.success && result.data.data) {
    const services = result.data.data;
    console.log(`\n✅ Found ${services.length} services`);
    
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.serviceName} - ₱${service.price}`);
    });
    
    return services;
  } else {
    console.log('\n❌ Failed to fetch services');
    return [];
  }
}

// Step 4: Create new appointment
async function testCreateAppointment(services) {
  console.log('\n' + '='.repeat(80));
  console.log('STEP 4: CREATE NEW APPOINTMENT');
  console.log('='.repeat(80));
  
  if (services.length === 0) {
    console.log('❌ No services available, cannot create appointment');
    return false;
  }
  
  // Select first 2 services
  const selectedServices = services.slice(0, 2);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointmentData = {
    patientName: `${currentUser.firstName} ${currentUser.lastName}`,
    contactNumber: currentUser.phone || '09123456789',
    email: currentUser.email,
    address: currentUser.address || 'Test Address',
    age: 30,
    sex: 'Male',
    serviceIds: selectedServices.map(s => s._id),
    serviceName: selectedServices.map(s => s.serviceName).join(', '),
    appointmentDate: tomorrow.toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    type: 'scheduled',
    priority: 'regular',
    totalPrice: totalPrice,
    notes: 'Test appointment created from comprehensive test script'
  };
  
  const result = await apiRequest('POST', '/appointments', appointmentData);
  
  if (result.data.success && result.data.data) {
    const apt = result.data.data;
    console.log('\n✅ Appointment created successfully!');
    console.log('   Appointment ID:', apt.appointmentId);
    console.log('   MongoDB ID:', apt._id);
    console.log('   Patient:', apt.patientName);
    console.log('   Services:', apt.serviceName);
    console.log('   Date:', apt.appointmentDate);
    console.log('   Total:', '₱' + apt.totalPrice);
    return true;
  } else {
    console.log('\n❌ Failed to create appointment:', result.data.message);
    if (result.data.errors) {
      console.log('   Validation errors:');
      result.data.errors.forEach(err => {
        console.log(`      - ${err.path}: ${err.msg}`);
      });
    }
    return false;
  }
}

// Step 5: Verify appointment appears in list
async function testVerifyAppointment(previousCount) {
  console.log('\n' + '='.repeat(80));
  console.log('STEP 5: VERIFY APPOINTMENT APPEARS IN LIST');
  console.log('='.repeat(80));
  
  // Small delay to ensure database is updated
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = await apiRequest('GET', '/appointments');
  
  if (result.data.success) {
    const newCount = result.data.data?.length || 0;
    console.log(`\n   Previous count: ${previousCount}`);
    console.log(`   Current count:  ${newCount}`);
    
    if (newCount > previousCount) {
      console.log(`\n✅ SUCCESS! New appointment appears in list (+${newCount - previousCount})`);
      
      // Show the newest appointment
      const newest = result.data.data[0];
      console.log('\n   Newest appointment:');
      console.log('      ID:', newest.appointmentId);
      console.log('      Patient:', newest.patientName);
      console.log('      Service:', newest.serviceName);
      console.log('      Date:', newest.appointmentDate);
      console.log('      Status:', newest.status);
      
      return true;
    } else {
      console.log('\n❌ FAILED! Appointment count did not increase');
      console.log('   This suggests the appointment was not saved properly');
      return false;
    }
  } else {
    console.log('\n❌ Failed to fetch appointments for verification');
    return false;
  }
}

// Main test execution
async function runComprehensiveTest() {
  console.log('\n');
  console.log('┌' + '─'.repeat(78) + '┐');
  console.log('│' + ' '.repeat(20) + 'MOBILE APP APPOINTMENT TEST' + ' '.repeat(31) + '│');
  console.log('│' + ' '.repeat(78) + '│');
  console.log('│  This test simulates the exact flow the mobile app uses:' + ' '.repeat(21) + '│');
  console.log('│  1. Login with patient credentials' + ' '.repeat(43) + '│');
  console.log('│  2. Fetch existing appointments' + ' '.repeat(47) + '│');
  console.log('│  3. Get available services' + ' '.repeat(52) + '│');
  console.log('│  4. Create a new appointment' + ' '.repeat(50) + '│');
  console.log('│  5. Verify it appears in the list' + ' '.repeat(45) + '│');
  console.log('└' + '─'.repeat(78) + '┘');
  
  try {
    // Step 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n❌ TEST FAILED: Could not login');
      return;
    }
    
    // Step 2: Fetch existing appointments
    const previousCount = await testFetchAppointments();
    
    // Step 3: Get available services
    const services = await getAvailableServices();
    if (services.length === 0) {
      console.log('\n❌ TEST FAILED: No services available');
      return;
    }
    
    // Step 4: Create new appointment
    const createSuccess = await testCreateAppointment(services);
    if (!createSuccess) {
      console.log('\n❌ TEST FAILED: Could not create appointment');
      return;
    }
    
    // Step 5: Verify appointment appears
    const verifySuccess = await testVerifyAppointment(previousCount);
    
    // Final result
    console.log('\n' + '='.repeat(80));
    console.log('FINAL RESULT');
    console.log('='.repeat(80));
    
    if (verifySuccess) {
      console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
      console.log('\nThe mobile app appointment flow is working correctly:');
      console.log('  • Authentication works');
      console.log('  • GET /appointments returns patient\'s appointments');
      console.log('  • POST /appointments creates new appointments');
      console.log('  • New appointments immediately appear in GET response');
      console.log('\nThe mobile app should now show appointments correctly!');
    } else {
      console.log('\n❌ TEST FAILED');
      console.log('\nThere may still be an issue with the appointment flow.');
      console.log('Check the detailed logs above to identify the problem.');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runComprehensiveTest();
