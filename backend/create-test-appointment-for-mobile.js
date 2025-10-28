const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Service = require('./models/Service');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/mdlab-direct';

async function createTestAppointment() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find the test patient
    const testPatient = await User.findOne({ email: 'patient@test.com' });
    
    if (!testPatient) {
      console.log('❌ Test patient not found');
      return;
    }
    
    console.log('👤 Creating appointment for:', testPatient.firstName, testPatient.lastName);
    console.log('   Patient ID (MongoDB):', testPatient._id.toString());
    console.log('   Patient ID (custom):', testPatient.patientId);
    console.log('');
    
    // Get some services
    const services = await Service.find({ isActive: true }).limit(2);
    
    if (services.length === 0) {
      console.log('❌ No services found in database');
      return;
    }
    
    console.log('📋 Using services:');
    services.forEach(s => console.log(`   - ${s.serviceName} (₱${s.price})`));
    console.log('');
    
    // Create appointment
    const appointmentData = {
      patient: testPatient._id,  // MongoDB ObjectId reference
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      contactNumber: testPatient.phone || '09123456789',
      email: testPatient.email,
      address: testPatient.address || 'Test Address',
      age: 30,
      sex: testPatient.gender === 'male' ? 'Male' : 'Female',  // Capitalized
      services: services.map(s => s._id),  // Array of service ObjectIds
      serviceName: services.map(s => s.serviceName).join(', '),  // Comma-separated string
      appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
      appointmentTime: '9:00 AM',
      status: 'pending',
      type: 'scheduled',  // Valid enum value
      priority: 'regular',  // Valid enum value
      totalPrice: services.reduce((sum, s) => sum + s.price, 0),
      createdBy: testPatient._id,
      createdByName: `${testPatient.firstName} ${testPatient.lastName}`,
      notes: 'Test appointment created from script'
    };
    
    console.log('📝 Creating appointment with data:');
    console.log(JSON.stringify(appointmentData, null, 2));
    console.log('');
    
    const appointment = await Appointment.create(appointmentData);
    
    console.log('✅ APPOINTMENT CREATED SUCCESSFULLY!');
    console.log('   Appointment ID:', appointment.appointmentId);
    console.log('   MongoDB ID:', appointment._id.toString());
    console.log('   Patient field:', appointment.patient.toString());
    console.log('   Services:', appointment.services.length);
    console.log('   Service Name:', appointment.serviceName);
    console.log('   Date:', appointment.appointmentDate);
    console.log('   Status:', appointment.status);
    console.log('');
    
    // Verify retrieval
    console.log('🔍 Verifying retrieval by patient ID...');
    const retrieved = await Appointment.find({ patient: testPatient._id });
    console.log(`   Found ${retrieved.length} appointment(s) for this patient`);
    
  } catch (error) {
    console.error('🚨 Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestAppointment();
