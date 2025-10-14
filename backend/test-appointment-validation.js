const mongoose = require('mongoose');

// Test the appointment validation without starting the full server
async function testAppointmentValidation() {
    try {
        // Sample serviceIds that would be sent from frontend
        const sampleServiceIds = [
            "507f1f77bcf86cd799439011",
            "507f1f77bcf86cd799439012", 
            "507f1f77bcf86cd799439013",
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439015",
            "507f1f77bcf86cd799439016",
            "507f1f77bcf86cd799439017",
            "507f1f77bcf86cd799439018",
            "507f1f77bcf86cd799439019",
            "507f1f77bcf86cd799439020"
        ];

        console.log('Testing serviceIds validation...');
        console.log('Sample serviceIds:', sampleServiceIds);
        console.log('Length:', sampleServiceIds.length);

        // Test each ID individually
        sampleServiceIds.forEach((id, index) => {
            const isValid = mongoose.Types.ObjectId.isValid(id);
            console.log(`ID ${index + 1}: ${id} - Valid: ${isValid}`);
        });

        // Test the validation logic that would be used in the appointment controller
        const validationErrors = [];
        
        if (!Array.isArray(sampleServiceIds) || sampleServiceIds.length === 0) {
            validationErrors.push('serviceIds must be a non-empty array');
        } else {
            sampleServiceIds.forEach((id, index) => {
                if (!id) {
                    validationErrors.push(`serviceIds[${index}] is null or undefined`);
                } else if (typeof id !== 'string') {
                    validationErrors.push(`serviceIds[${index}] must be a string, got ${typeof id}`);
                } else if (!mongoose.Types.ObjectId.isValid(id)) {
                    validationErrors.push(`serviceIds[${index}] is not a valid ObjectId: ${id}`);
                }
            });
        }

        if (validationErrors.length > 0) {
            console.log('\nValidation Errors Found:');
            validationErrors.forEach(error => console.log('-', error));
        } else {
            console.log('\nAll serviceIds passed validation!');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAppointmentValidation();