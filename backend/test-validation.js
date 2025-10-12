const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/MDLAB_DIRECT')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    testValidation();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function testValidation() {
  try {
    // Test data similar to what the frontend is sending
    const testData = {
      patientName: "Test Patient",
      contactNumber: "09123456789",
      email: "test@email.com",
      age: 30,
      sex: "Male",
      serviceIds: [
        "67002d8e9ee6e80a44c39f01", // Use actual service IDs from your database
        "67002d8e9ee6e80a44c39f02",
        "67002d8e9ee6e80a44c39f03",
        "67002d8e9ee6e80a44c39f04",
        "67002d8e9ee6e80a44c39f05",
        "67002d8e9ee6e80a44c39f06",
        "67002d8e9ee6e80a44c39f07",
        "67002d8e9ee6e80a44c39f08",
        "67002d8e9ee6e80a44c39f09",
        "67002d8e9ee6e80a44c39f10",
        "67002d8e9ee6e80a44c39f11",
        "67002d8e9ee6e80a44c39f12",
        "67002d8e9ee6e80a44c39f13",
        "67002d8e9ee6e80a44c39f14",
        "67002d8e9ee6e80a44c39f15",
        "67002d8e9ee6e80a44c39f16",
        "67002d8e9ee6e80a44c39f17",
        "67002d8e9ee6e80a44c39f18",
        "67002d8e9ee6e80a44c39f19",
        "67002d8e9ee6e80a44c39f20"
      ],
      appointmentDate: "2025-10-13",
      appointmentTime: "10:00 AM",
      type: "walk-in",
      priority: "regular",
      totalPrice: 5000
    };

    console.log('🧪 Testing validation with 20 services...');
    console.log('📦 Test data:', JSON.stringify(testData, null, 2));

    // Test each validation rule manually
    console.log('\n📋 Validation Results:');
    
    // Test serviceIds validation
    const serviceIdsValidation = body('serviceIds')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Service IDs must be a non-empty array');

    // Test the custom validation for MongoDB ObjectIds
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    
    console.log('🔍 ServiceIds validation:');
    console.log('- Is array:', Array.isArray(testData.serviceIds));
    console.log('- Array length:', testData.serviceIds.length);
    console.log('- Min length (1):', testData.serviceIds.length >= 1);
    
    console.log('\n🆔 ObjectId validation:');
    let invalidIds = [];
    testData.serviceIds.forEach((id, index) => {
      const isValid = isValidObjectId(id);
      if (!isValid) {
        invalidIds.push({ index, id });
      }
      console.log(`- [${index}] ${id}: ${isValid ? '✅' : '❌'}`);
    });
    
    if (invalidIds.length > 0) {
      console.log('\n❌ Invalid ObjectIds found:', invalidIds);
    } else {
      console.log('\n✅ All ObjectIds are valid');
    }

    // Test contact number validation
    const contactRegex = /^(\+63|63|0)?[0-9]{9,11}$/;
    const contactValid = contactRegex.test(testData.contactNumber);
    console.log('\n📞 Contact validation:');
    console.log(`- Number: ${testData.contactNumber}`);
    console.log(`- Valid: ${contactValid ? '✅' : '❌'}`);

    // Test email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(testData.email);
    console.log('\n📧 Email validation:');
    console.log(`- Email: ${testData.email}`);
    console.log(`- Valid: ${emailValid ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error during validation test:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Test completed, connection closed');
  }
}