const mongoose = require('mongoose');
const Service = require('./models/Service');

// Test the actual service data structure
async function testServiceStructure() {
    try {
        // Connect to MongoDB (using same connection string from server.js)
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a sample of services to see their structure
        const services = await Service.find({}).limit(5);
        console.log('\nSample Services Structure:');
        console.log('Number of services found:', services.length);
        
        services.forEach((service, index) => {
            console.log(`\nService ${index + 1}:`);
            console.log('- _id:', service._id);
            console.log('- _id type:', typeof service._id);
            console.log('- _id is ObjectId?', mongoose.Types.ObjectId.isValid(service._id));
            console.log('- serviceName:', service.serviceName);
            console.log('- category:', service.category);
            console.log('- price:', service.price);
            console.log('- isActive:', service.isActive);
        });

        // Test what happens when we convert to string
        if (services.length > 0) {
            const firstService = services[0];
            console.log('\nTesting _id conversion:');
            console.log('- Original _id:', firstService._id);
            console.log('- _id.toString():', firstService._id.toString());
            console.log('- String(_id):', String(firstService._id));
            console.log('- Is string valid ObjectId?', mongoose.Types.ObjectId.isValid(firstService._id.toString()));
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testServiceStructure();