// Quick appointment system health check script
const axios = require('axios');

async function checkAppointmentSystemHealth() {
    try {
        console.log('🔍 APPOINTMENT SYSTEM HEALTH CHECK...\n');
        
        // Use a valid token
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDIwODM1ZDg5MDQ0NzdhYmYwNTM5YiIsImVtYWlsIjoicmVjZXB0aW9uaXN0QG1kbGFiLmNvbSIsInJvbGUiOiJyZWNlcHRpb25pc3QiLCJpYXQiOjE3NjA3MTIwNDcsImV4cCI6MTc2MDc5ODQ0N30.vv-Q94krolrzdXcK13IAomcY8mlK6pD3U4e3OOzmaD0';
        
        // Test 1: Basic appointments API
        console.log('1️⃣ Testing appointments API...');
        try {
            const response = await axios.get('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ Appointments API: ${response.status} - Found ${response.data.data?.length || 0} appointments`);
        } catch (error) {
            console.log(`❌ Appointments API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
        
        // Test 2: Services API (needed for appointments)
        console.log('\n2️⃣ Testing services API...');
        try {
            const response = await axios.get('http://localhost:5000/api/services', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ Services API: ${response.status} - Found ${response.data.data?.length || 0} services`);
        } catch (error) {
            console.log(`❌ Services API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
        
        // Test 3: User authentication
        console.log('\n3️⃣ Testing authentication...');
        try {
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ Authentication: ${response.status} - User: ${response.data.data?.email || 'Unknown'} (${response.data.data?.role || 'Unknown'})`);
        } catch (error) {
            console.log(`❌ Authentication Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
        
        // Test 4: Try creating a test appointment
        console.log('\n4️⃣ Testing appointment creation...');
        try {
            const testAppointment = {
                patientName: 'Error Test Patient',
                age: 30,
                sex: 'Male',
                address: '123 Test St',
                contactNumber: '09123456789',
                email: 'test@example.com',
                appointmentDate: new Date().toISOString().split('T')[0],
                appointmentTime: '10:00',
                serviceName: 'Complete Blood Count (CBC)',
                services: [] // This might be causing issues
            };
            
            const response = await axios.post('http://localhost:5000/api/appointments', testAppointment, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Appointment Creation: ${response.status} - Created appointment: ${response.data.data?.appointmentId || 'Unknown ID'}`);
        } catch (error) {
            console.log(`❌ Appointment Creation Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            if (error.response?.data?.errors) {
                console.log('   Validation Errors:', error.response.data.errors);
            }
        }
        
        console.log('\n🏁 Health check completed!');
        
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

checkAppointmentSystemHealth();