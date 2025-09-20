// Quick script to create a mock service
const mongoose = require('mongoose');

// Service Schema (matching the backend model)
const serviceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  serviceName: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['blood_tests', 'urine_tests', 'imaging', 'pathology', 'special_tests', 'package_deals', 'emergency_tests']
  },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  sampleType: { type: String },
  fastingRequired: { type: Boolean, default: false },
  ageRange: { type: String },
  prerequisites: { type: String },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  homeVisitAvailable: { type: Boolean, default: false }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

// Connect to MongoDB and create mock service
const createMockService = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');

    // Create a mock service
    const mockService = new Service({
      serviceId: 'TEST001',
      serviceName: 'Test Blood Sugar',
      category: 'blood_tests',
      description: 'Quick blood glucose test for diabetes monitoring',
      price: 150,
      duration: 15,
      sampleType: 'Blood',
      fastingRequired: true,
      ageRange: '18-80',
      prerequisites: 'Fasting for 8-12 hours',
      isActive: true,
      isPopular: true,
      homeVisitAvailable: true
    });

    await mockService.save();
    console.log('Mock service created successfully:', mockService);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating mock service:', error);
    await mongoose.disconnect();
  }
};

createMockService();