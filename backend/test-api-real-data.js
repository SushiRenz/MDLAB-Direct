const axios = require('axios');

async function testAppointmentCreation() {
    try {
        console.log('🧪 Testing appointment creation with detailed validation...\n');
        
        // Use the working token
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDIwODM1ZDg5MDQ0NzdhYmYwNTM5YiIsImVtYWlsIjoicmVjZXB0aW9uaXN0QG1kbGFiLmNvbSIsInJvbGUiOiJyZWNlcHRpb25pc3QiLCJpYXQiOjE3NjA3MTIwNDcsImV4cCI6MTc2MDc5ODQ0N30.vv-Q94krolrzdXcK13IAomcY8mlK6pD3U4e3OOzmaD0';
        
        console.log('🔑 Generated token for testing');
        
        // First, get available services to use real service IDs
        console.log('1️⃣ Getting available services...');
        const servicesResponse = await axios.get('http://localhost:5000/api/services', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const services = servicesResponse.data.data || [];
        console.log(`✅ Found ${services.length} services`);
        
        if (services.length === 0) {
            console.log('❌ No services found - cannot test appointment creation');
            return;
        }
        
        // Use first few services for testing
        const testServices = services.slice(0, 2);
        const serviceIds = testServices.map(s => s._id);
        const serviceNames = testServices.map(s => s.serviceName).join(', ');
        const totalPrice = testServices.reduce((sum, s) => sum + (s.price || 0), 0);
        
        console.log('📋 Test services:', testServices.map(s => `${s.serviceName} (ID: ${s._id}, Price: ${s.price})`));
        console.log('🆔 Service IDs:', serviceIds);
        console.log('� Total price:', totalPrice);
        
        // Test appointment data (simulating what frontend sends)
        const testAppointment = {
            patientName: 'Validation Test Patient',
            contactNumber: '09123456789',
            email: 'test@example.com',
            address: '123 Test Street, Test City',
            age: 30,
            sex: 'Male',
            serviceIds: serviceIds, // This might be the issue
            serviceName: serviceNames,
            appointmentDate: new Date().toISOString().split('T')[0], // Today's date
            appointmentTime: '10:00',
            totalPrice: totalPrice,
            type: 'scheduled',
            priority: 'regular',
            notes: 'Test appointment for validation debugging'
        };
        
        console.log('\n2️⃣ Testing appointment creation...');
        console.log('📤 Sending data:');
        Object.entries(testAppointment).forEach(([key, value]) => {
            console.log(`   ${key}: ${value} (${typeof value}${Array.isArray(value) ? `, array length: ${value.length}` : ''})`);
        });
        
        try {
            const response = await axios.post('http://localhost:5000/api/appointments', testAppointment, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ SUCCESS!');
            console.log('📋 Created appointment:', response.data.data.appointmentId);
            console.log('👤 Patient:', response.data.data.patientName);
            console.log('🧪 Services:', response.data.data.serviceName);
            
        } catch (error) {
            console.log('❌ VALIDATION FAILED:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message);
            
            if (error.response?.data?.errors) {
                console.log('   Detailed errors:');
                error.response.data.errors.forEach((err, i) => {
                    console.log(`     ${i + 1}. Field: ${err.path || err.param || 'unknown'}`);
                    console.log(`        Value: ${err.value}`);
                    console.log(`        Error: ${err.msg}`);
                    console.log('');
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAppointmentCreation();