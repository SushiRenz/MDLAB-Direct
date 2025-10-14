// Test the actual API endpoint with HTTP (not HTTPS)
const http = require('http');
const mongoose = require('mongoose');

async function testAPIWithHTTP() {
    try {
        // Get real service data
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        
        const Service = require('./models/Service');
        const services = await Service.find({ isActive: true }).limit(10); // Test with 10 services
        
        await mongoose.disconnect();
        
        const serviceIds = services.map(service => service._id.toString());
        
        // Prepare the request data exactly as frontend would send it
        const requestData = {
            patientName: 'Test Patient API',
            contactNumber: '09123456789',
            email: 'test@example.com',
            age: 25,
            sex: 'Male',
            serviceIds: serviceIds,
            serviceName: services.map(s => s.serviceName).join(', '),
            appointmentDate: '2025-01-20',
            appointmentTime: '10:00 AM',
            type: 'scheduled',
            priority: 'regular',
            totalPrice: services.reduce((sum, s) => sum + s.price, 0),
            notes: 'Test appointment with multiple services',
            reasonForVisit: 'Testing appointment booking'
        };
        
        const postData = JSON.stringify(requestData);
        
        console.log('Testing API call with HTTP...');
        console.log('Services count:', serviceIds.length);
        console.log('Total price:', requestData.totalPrice);
        console.log('Request size:', postData.length, 'bytes');
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/appointments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
                // Note: Removed Authorization header to test without authentication first
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                console.log(`✅ Connected! Status: ${res.statusCode}`);
                
                let responseBody = '';
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response body:', responseBody);
                    
                    try {
                        const parsedResponse = JSON.parse(responseBody);
                        console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
                    } catch (e) {
                        console.log('Response is not JSON:', responseBody);
                    }
                    
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.log('❌ Request failed:', error.message);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAPIWithHTTP();