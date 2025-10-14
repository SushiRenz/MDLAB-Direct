const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Simulate the exact HTTP request data that would come from frontend
async function testHTTPRequest() {
    try {
        // Connect to database to get real service IDs
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        
        const Service = require('./models/Service');
        const services = await Service.find({ isActive: true }).limit(5);
        
        // Simulate how frontend converts ObjectId to string in JSON
        const serviceIds = services.map(service => service._id.toString());
        
        console.log('Simulating HTTP Request Data:');
        console.log('serviceIds (as strings):', serviceIds);
        console.log('serviceIds length:', serviceIds.length);
        
        // Simulate the request body exactly as it would be sent over HTTP
        const requestBody = {
            patientName: 'Test Patient',
            contactNumber: '09123456789',
            email: 'test@example.com',
            serviceIds: serviceIds, // This is now array of strings, as JSON would send
            appointmentDate: '2025-01-15',
            appointmentTime: '10:00 AM',
            type: 'scheduled',
            priority: 'regular'
        };
        
        console.log('\nRequest body type check:');
        console.log('- serviceIds is array?', Array.isArray(requestBody.serviceIds));
        console.log('- serviceIds length:', requestBody.serviceIds.length);
        
        requestBody.serviceIds.forEach((id, index) => {
            console.log(`- serviceIds[${index}]:`, id, typeof id, 'valid?', mongoose.Types.ObjectId.isValid(id));
        });
        
        // Test the validation using express-validator exactly as the route does
        const validationMiddlewares = [
            body('serviceIds')
              .optional()
              .isArray({ min: 1 })
              .withMessage('Service IDs must be a non-empty array')
              .custom((value, { req }) => {
                console.log('\n=== CUSTOM VALIDATION ===');
                console.log('value:', value);
                console.log('value type:', typeof value);
                console.log('value is array?', Array.isArray(value));
                
                // At least one of serviceId or serviceIds must be provided
                if (!req.body.serviceId && (!value || value.length === 0)) {
                  throw new Error('Either serviceId or serviceIds must be provided');
                }
                
                // If serviceIds is provided, validate each ID
                if (value && value.length > 0) {
                  for (let i = 0; i < value.length; i++) {
                    const id = value[i];
                    console.log(`Validating ID ${i}: ${id} (type: ${typeof id})`);
                    
                    // Convert to string if it's not already
                    const idStr = typeof id === 'string' ? id : String(id);
                    console.log(`Converted to string: ${idStr}`);
                    
                    if (!mongoose.Types.ObjectId.isValid(idStr)) {
                      throw new Error(`Service ID at position ${i + 1} is not a valid MongoDB ObjectId: ${idStr} (type: ${typeof id})`);
                    }
                  }
                }
                
                return true;
              })
        ];
        
        // Create a mock request object for validation
        const mockReq = {
            body: requestBody
        };
        
        // Manually run the validation
        try {
            const validationChain = validationMiddlewares[0];
            await validationChain.run(mockReq);
            
            // Check for errors
            const errors = validationResult(mockReq);
            if (!errors.isEmpty()) {
                console.log('\n❌ EXPRESS-VALIDATOR ERRORS:');
                errors.array().forEach(error => {
                    console.log(`- Field: ${error.param}, Message: ${error.msg}`);
                });
            } else {
                console.log('\n✅ EXPRESS-VALIDATOR PASSED');
            }
        } catch (validationError) {
            console.log('\n❌ VALIDATION EXCEPTION:', validationError.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testHTTPRequest();