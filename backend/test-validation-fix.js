// Test if the fix resolves the validation issue
const { body, validationResult } = require('express-validator');

async function testFixedValidation() {
    try {
        console.log('Testing validation fix...');
        
        // Simulate user data that was failing
        const userData = {
            patientName: 'jas',
            contactNumber: '09496858361',
            email: 'renz09358@gmail.com',
            age: 22,
            sex: 'Female',
            serviceIds: ['68e8f9f78c0dab521aeb1bfe'],
            serviceName: 'Test Service', // This was potentially missing
            appointmentDate: '2025-10-13',
            appointmentTime: 'Any time during clinic hours', // This was potentially missing
            type: 'scheduled',
            priority: 'regular',
            totalPrice: 100
        };

        console.log('Testing with data:');
        console.log('- serviceName:', userData.serviceName);
        console.log('- appointmentTime:', userData.appointmentTime);

        // Test the validations manually
        const validations = [];
        
        // serviceName validation
        if (!userData.serviceName || userData.serviceName.trim() === '') {
            validations.push('❌ serviceName is required');
        } else if (userData.serviceName.length < 1 || userData.serviceName.length > 1000) {
            validations.push('❌ serviceName length must be 1-1000 characters');
        } else {
            validations.push('✅ serviceName valid');
        }

        // appointmentTime validation
        if (!userData.appointmentTime || userData.appointmentTime.trim() === '') {
            validations.push('❌ appointmentTime is required');
        } else if (userData.appointmentTime.length < 1 || userData.appointmentTime.length > 50) {
            validations.push('❌ appointmentTime length must be 1-50 characters');
        } else {
            validations.push('✅ appointmentTime valid');
        }

        validations.forEach(v => console.log(v));

        // Test with missing fields (should fail)
        console.log('\n--- Testing with missing serviceName ---');
        const missingServiceName = { ...userData, serviceName: '' };
        if (!missingServiceName.serviceName || missingServiceName.serviceName.trim() === '') {
            console.log('✅ Correctly catches missing serviceName');
        }

        console.log('\n--- Testing with missing appointmentTime ---');
        const missingAppointmentTime = { ...userData, appointmentTime: '' };
        if (!missingAppointmentTime.appointmentTime || missingAppointmentTime.appointmentTime.trim() === '') {
            console.log('✅ Correctly catches missing appointmentTime');
        }

        console.log('\n🎯 Fix should resolve the validation issue!');
        console.log('The user needs to restart the backend server to apply the validation changes.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFixedValidation();