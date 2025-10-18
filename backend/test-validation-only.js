// Simple validation test without auth
const mongoose = require('mongoose');

function testServiceIdValidation() {
    console.log('🔍 Testing ServiceId validation...\n');
    
    // Test service IDs from the previous output
    const testServiceIds = ['68e8f9f78c0dab521aeb1bfe', '68e8f9f78c0dab521aeb1bff'];
    
    console.log('Testing service IDs:');
    testServiceIds.forEach((id, index) => {
        console.log(`${index + 1}. ID: ${id}`);
        console.log(`   Type: ${typeof id}`);
        console.log(`   Length: ${id.length}`);
        console.log(`   Is valid ObjectId: ${mongoose.Types.ObjectId.isValid(id)}`);
        
        try {
            const objectId = new mongoose.Types.ObjectId(id);
            console.log(`   Can create ObjectId: YES (${objectId})`);
        } catch (error) {
            console.log(`   Can create ObjectId: NO (${error.message})`);
        }
        console.log('');
    });
    
    // Test typical frontend scenarios
    console.log('Testing common frontend data issues:');
    
    // Test with null/undefined
    console.log('1. Testing null serviceIds:');
    const nullIds = null;
    console.log(`   Value: ${nullIds}, Type: ${typeof nullIds}, Is Array: ${Array.isArray(nullIds)}`);
    
    // Test with empty array
    console.log('2. Testing empty array:');
    const emptyIds = [];
    console.log(`   Value: ${emptyIds}, Type: ${typeof emptyIds}, Is Array: ${Array.isArray(emptyIds)}, Length: ${emptyIds.length}`);
    
    // Test with string IDs (correct format)
    console.log('3. Testing string array:');
    const stringIds = ['68e8f9f78c0dab521aeb1bfe', '68e8f9f78c0dab521aeb1bff'];
    console.log(`   Value: ${stringIds}, Type: ${typeof stringIds}, Is Array: ${Array.isArray(stringIds)}, Length: ${stringIds.length}`);
    stringIds.forEach((id, i) => {
        console.log(`     [${i}]: ${id} (${typeof id}) - Valid: ${mongoose.Types.ObjectId.isValid(id)}`);
    });
    
    // Test validation logic from routes/appointments.js
    console.log('\n🔍 Simulating validation logic:');
    
    function validateServiceIds(serviceIds, serviceId) {
        console.log('Running validation logic...');
        console.log(`serviceId: ${serviceId}`);
        console.log(`serviceIds: ${serviceIds} (type: ${typeof serviceIds}, isArray: ${Array.isArray(serviceIds)})`);
        
        // At least one of serviceId or serviceIds must be provided
        if (!serviceId && (!serviceIds || serviceIds.length === 0)) {
            return 'Either serviceId or serviceIds must be provided';
        }
        
        // If serviceIds is provided, validate each ID
        if (serviceIds && serviceIds.length > 0) {
            for (let i = 0; i < serviceIds.length; i++) {
                const id = serviceIds[i];
                const idStr = typeof id === 'string' ? id : String(id);
                if (!mongoose.Types.ObjectId.isValid(idStr)) {
                    return `Service ID at position ${i + 1} is not a valid MongoDB ObjectId: ${idStr} (type: ${typeof id})`;
                }
            }
        }
        
        return 'VALID';
    }
    
    // Test different scenarios
    const testCases = [
        { serviceId: null, serviceIds: null, description: 'Both null' },
        { serviceId: null, serviceIds: [], description: 'Empty array' },
        { serviceId: null, serviceIds: ['68e8f9f78c0dab521aeb1bfe'], description: 'Valid single ID' },
        { serviceId: null, serviceIds: ['68e8f9f78c0dab521aeb1bfe', '68e8f9f78c0dab521aeb1bff'], description: 'Valid multiple IDs' },
        { serviceId: null, serviceIds: ['invalid-id'], description: 'Invalid ID' },
        { serviceId: '68e8f9f78c0dab521aeb1bfe', serviceIds: null, description: 'Valid serviceId only' }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`\nTest ${index + 1}: ${testCase.description}`);
        const result = validateServiceIds(testCase.serviceIds, testCase.serviceId);
        console.log(`Result: ${result}`);
    });
}

testServiceIdValidation();