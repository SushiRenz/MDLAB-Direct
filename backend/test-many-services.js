const mongoose = require('mongoose');
const Service = require('./models/Service');

// Test with many services like the user mentioned (20 tests)
async function testManyServices() {
    try {
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Get 20 services to simulate user's scenario
        const services = await Service.find({ isActive: true }).limit(20);
        console.log(`Testing with ${services.length} services (simulating user's 20 test scenario)`);
        
        const serviceIds = services.map(service => service._id.toString());
        
        console.log('ServiceIds as strings:', serviceIds);
        console.log('Array length:', serviceIds.length);
        
        // Test validation for each ID
        let validCount = 0;
        serviceIds.forEach((id, index) => {
            const isValid = mongoose.Types.ObjectId.isValid(id);
            if (isValid) validCount++;
            if (!isValid) {
                console.log(`❌ Invalid ID at index ${index}: ${id}`);
            }
        });
        
        console.log(`✅ ${validCount}/${serviceIds.length} IDs are valid`);
        
        // Create appointment data with 20 services
        const appointmentData = {
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
        
        console.log('\nAppointment data summary:');
        console.log('- Patient:', appointmentData.patientName);
        console.log('- Services count:', appointmentData.serviceIds.length);
        console.log('- Total price:', appointmentData.totalPrice);
        console.log('- Service names length:', appointmentData.serviceName.length);
        
        // Check if service names are too long (might cause validation issues)
        if (appointmentData.serviceName.length > 1000) {
            console.log('⚠️  WARNING: Service names string is very long:', appointmentData.serviceName.length, 'characters');
            console.log('This might cause database field length issues');
        }
        
        // Test if the appointment document would be too large
        const documentSize = JSON.stringify(appointmentData).length;
        console.log('- Estimated document size:', documentSize, 'bytes');
        
        if (documentSize > 16000000) { // MongoDB document limit is 16MB
            console.log('❌ Document too large for MongoDB');
        } else if (documentSize > 1000000) { // 1MB warning
            console.log('⚠️  Large document size might cause performance issues');
        } else {
            console.log('✅ Document size is acceptable');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testManyServices();