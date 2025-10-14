// Test the actual API endpoint by making a direct HTTP request
const https = require('https');
const mongoose = require('mongoose');

async function testAPIDirectly() {
    try {
        // Get real service data
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        
        const Service = require('./models/Service');
        const services = await Service.find({ isActive: true }).limit(5);
        
        await mongoose.disconnect();
        
        const serviceIds = services.map(service => service._id.toString());
        
        // Prepare the request data exactly as frontend would send it
        const requestData = {
            patientName: 'Test Patient',
            contactNumber: '09123456789',
            email: 'test@example.com',
            serviceIds: serviceIds,
            serviceName: services.map(s => s.serviceName).join(', '),
            appointmentDate: '2025-01-15',
            appointmentTime: '10:00 AM',
            type: 'scheduled',
            priority: 'regular',
            totalPrice: services.reduce((sum, s) => sum + s.price, 0)
        };
        
        const postData = JSON.stringify(requestData);
        
        console.log('Testing direct API call to appointment endpoint...');
        console.log('Request data:', JSON.stringify(requestData, null, 2));
        console.log('Request size:', postData.length, 'bytes');
        
        // Try to make request to localhost:5000
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/appointments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': 'Bearer fake-token-for-testing' // Would need real token
            }
        };
        
        console.log('Attempting to connect to backend server...');
        
        const req = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            
            res.on('end', () => {
                console.log('Response:', responseBody);
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Connection failed (server probably not running):', error.message);
            console.log('This confirms we need to start the backend server to test properly');
        });
        
        req.write(postData);
        req.end();
        
        // Wait a bit for the request to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ Test setup failed:', error.message);
    }
}

testAPIDirectly();