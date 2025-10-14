const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Service = require('./models/Service');

// Simulate the appointment validation exactly as it happens in the backend
async function testAppointmentBooking() {
    try {
        // Connect to MongoDB
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get actual services from database to test with real IDs
        const services = await Service.find({ isActive: true }).limit(10);
        console.log(`Found ${services.length} active services`);
        
        // Simulate frontend data structure
        const selectedTests = services.map(service => ({
            _id: service._id,
            serviceName: service.serviceName,
            price: service.price,
            category: service.category
        }));

        console.log('\nSelected Tests Structure:');
        selectedTests.forEach((test, index) => {
            console.log(`Test ${index + 1}:`);
            console.log('- _id:', test._id);
            console.log('- _id type:', typeof test._id);
            console.log('- serviceName:', test.serviceName);
        });

        // Create serviceIds array as frontend would
        const serviceIds = selectedTests.map(test => test._id);
        console.log('\nServiceIds Array:');
        console.log('- Array:', serviceIds);
        console.log('- Length:', serviceIds.length);
        console.log('- Is Array?', Array.isArray(serviceIds));

        // Test each individual ID
        serviceIds.forEach((id, index) => {
            console.log(`ID ${index + 1}:`);
            console.log('- Value:', id);
            console.log('- Type:', typeof id);
            console.log('- String version:', String(id));
            console.log('- Is valid ObjectId?', mongoose.Types.ObjectId.isValid(String(id)));
        });

        // Simulate the validation logic from appointmentController
        console.log('\n=== APPOINTMENT VALIDATION SIMULATION ===');
        
        const appointmentData = {
            patientName: 'Test Patient',
            contactNumber: '09123456789',
            email: 'test@example.com',
            serviceIds: serviceIds,
            serviceName: selectedTests.map(t => t.serviceName).join(', '),
            appointmentDate: '2025-01-15',
            appointmentTime: '10:00 AM',
            type: 'scheduled',
            priority: 'regular'
        };

        // Test the validation manually
        const validationErrors = [];
        
        // Check serviceIds
        if (!appointmentData.serviceIds || !Array.isArray(appointmentData.serviceIds) || appointmentData.serviceIds.length === 0) {
            validationErrors.push('serviceIds must be a non-empty array');
        } else {
            appointmentData.serviceIds.forEach((id, index) => {
                if (!id) {
                    validationErrors.push(`serviceIds[${index}] is null or undefined`);
                } else if (typeof id !== 'string' && typeof id !== 'object') {
                    validationErrors.push(`serviceIds[${index}] must be a string or ObjectId, got ${typeof id}`);
                } else if (!mongoose.Types.ObjectId.isValid(String(id))) {
                    validationErrors.push(`serviceIds[${index}] is not a valid ObjectId: ${id}`);
                }
            });
        }

        // Check required fields
        if (!appointmentData.patientName) validationErrors.push('Patient name is required');
        if (!appointmentData.contactNumber) validationErrors.push('Contact number is required');
        if (!appointmentData.appointmentDate) validationErrors.push('Appointment date is required');

        if (validationErrors.length > 0) {
            console.log('\n❌ VALIDATION FAILED:');
            validationErrors.forEach(error => console.log('-', error));
        } else {
            console.log('\n✅ VALIDATION PASSED');
            console.log('All validations successful!');
            
            // Test if services exist in database
            console.log('\n=== SERVICE EXISTENCE CHECK ===');
            const stringIds = serviceIds.map(id => String(id));
            const foundServices = await Service.find({ _id: { $in: stringIds } });
            console.log(`Found ${foundServices.length} out of ${stringIds.length} services in database`);
            
            if (foundServices.length !== stringIds.length) {
                console.log('❌ Some services not found in database');
                const foundIds = foundServices.map(s => String(s._id));
                const missingIds = stringIds.filter(id => !foundIds.includes(id));
                console.log('Missing service IDs:', missingIds);
            } else {
                console.log('✅ All services found in database');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testAppointmentBooking();