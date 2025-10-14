const http = require('http');

// Quick test without connecting to DB
const testData = {
    patientName: 'jasmine',
    contactNumber: '09496858361', 
    email: 'renz09358@gmail.com',
    age: 22,
    sex: 'Female',
    serviceIds: ['68e8f9f78c0dab521aeb1bfe'],
    serviceName: 'Test Service Name',
    appointmentDate: '2025-10-13',
    appointmentTime: 'Any time during clinic hours',
    type: 'scheduled',
    priority: 'regular',
    totalPrice: 100
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/appointments',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing validation with server...');
console.log('Sending data:', testData);

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response:', body);
        try {
            const parsed = JSON.parse(body);
            if (parsed.errors) {
                console.log('\nValidation Errors:');
                parsed.errors.forEach((err, i) => {
                    console.log(`${i + 1}. Field: ${err.param || err.path}, Message: ${err.msg || err.message}`);
                });
            }
        } catch (e) {
            console.log('Could not parse response as JSON');
        }
    });
});

req.on('error', (error) => {
    console.log('Error:', error.message);
});

req.write(postData);
req.end();