const http = require('http');

// Test the validation with a complete request to see if the issue is resolved
async function testValidationWithCompleteData() {
    try {
        const completeData = {
            patientName: 'jasmine',
            contactNumber: '09496858361',
            email: 'renz09358@gmail.com',
            age: 22,
            sex: 'Female',
            serviceIds: ['68e8f9f78c0dab521aeb1bfe'],
            serviceName: 'Test Service Name', // Now included
            appointmentDate: '2025-10-13',
            appointmentTime: 'Any time during clinic hours', // Now included
            type: 'scheduled',
            priority: 'regular',
            totalPrice: 100,
            notes: 'Test appointment',
            reasonForVisit: 'Testing'
        };

        const postData = JSON.stringify(completeData);
        
        console.log('Testing with complete data including serviceName and appointmentTime...');
        console.log('Data being sent:', JSON.stringify(completeData, null, 2));

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/appointments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
                // Note: No auth token for now to test validation only
            }
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                console.log(`Response Status: ${res.statusCode}`);
                
                let responseBody = '';
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response Body:', responseBody);
                    
                    try {
                        const parsedResponse = JSON.parse(responseBody);
                        if (res.statusCode === 401) {
                            console.log('✅ Got 401 Unauthorized - validation passed, auth is the issue');
                        } else if (res.statusCode === 400) {
                            console.log('❌ Still getting 400 Bad Request');
                            if (parsedResponse.errors) {
                                console.log('Validation errors:', parsedResponse.errors);
                            }
                        }
                    } catch (e) {
                        console.log('Non-JSON response:', responseBody);
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

testValidationWithCompleteData();