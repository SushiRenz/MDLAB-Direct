const mongoose = require('mongoose');
const TestResult = require('./models/TestResult');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Service = require('./models/Service');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mdlab', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data for Review Results...');

    // Create a receptionist user first or find existing
    let receptionist = await User.findOne({ 
      $or: [
        { email: 'receptionist@example.com' },
        { username: 'receptionist1' },
        { role: 'receptionist' }
      ]
    });
    
    if (!receptionist) {
      receptionist = new User({
        username: 'testreceptionist',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'receptionist@example.com',
        passwordHash: 'password123',
        phone: '09111111111',
        address: {
          street: '456 Admin Street',
          city: 'Admin City',
          province: 'Admin Province',
          zipCode: '5678'
        },
        dateOfBirth: new Date('1990-05-20'),
        gender: 'female',
        role: 'receptionist'
      });
      await receptionist.save();
      console.log('✅ Created receptionist user');
    } else {
      console.log('ℹ️ Using existing receptionist user');
    }

    // Create a test user if not exists
    let testUser = await User.findOne({ email: 'test.patient@example.com' });
    if (!testUser) {
      testUser = new User({
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test.patient@example.com',
        passwordHash: 'password123',
        phone: '09123456789',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          province: 'Test Province',
          zipCode: '1234'
        },
        dateOfBirth: new Date('1988-01-15'),
        gender: 'male',
        role: 'patient'
      });
      await testUser.save();
      console.log('✅ Created test user');
    }

    // Create a test appointment
    let testAppointment = await Appointment.findOne({ patientName: 'Jane Smith' });
    if (!testAppointment) {
      testAppointment = new Appointment({
        patientName: 'Jane Smith',
        age: 28,
        sex: 'Female',
        address: '456 Main Street, Downtown',
        contactNumber: '09987654321',
        email: 'jane.smith@email.com',
        appointmentDate: new Date(),
        appointmentTime: '10:00 AM',
        serviceName: 'Complete Blood Count',
        status: 'completed',
        isWalkIn: false,
        createdBy: receptionist._id,
        createdByName: `${receptionist.firstName} ${receptionist.lastName}`
      });
      await testAppointment.save();
      console.log('✅ Created test appointment');
    }

    // Find any existing service to use as reference
    let existingService = await Service.findOne();
    if (!existingService) {
      console.log('⚠️ No services found, creating test services');
      existingService = new Service({
        serviceName: 'Complete Blood Count',
        description: 'Complete blood count with differential - CBC test',
        category: 'hematology',
        sampleType: 'blood',
        duration: '2-4 hours',
        price: 250,
        createdBy: receptionist._id
      });
      await existingService.save();
      console.log('✅ Created CBC service');
    }

    // Create test results for registered patient
    const testResult1 = new TestResult({
      patient: testUser._id,
      appointment: testAppointment._id,
      service: existingService._id,
      testType: 'Complete Blood Count',
      sampleId: 'LAB-001-2024',
      sampleDate: new Date(),
      results: new Map([
        ['wbc', '8.5 x10³/µL'],
        ['rbc', '4.5 x10⁶/µL'],
        ['hemoglobin', '14.2 g/dL'],
        ['hematocrit', '42%']
      ]),
      status: 'completed',
      completedAt: new Date(),
      notes: 'All values within normal range',
      createdBy: receptionist._id
    });

    // Create test result for walk-in patient
    const testResult2 = new TestResult({
      patient: 'WALKIN-MARIA-' + Date.now(),
      patientInfo: {
        name: 'Maria Garcia',
        age: 45,
        gender: 'Female',
        address: '789 Oak Avenue, Uptown',
        contactNumber: '09555123456'
      },
      isWalkInPatient: true,
      service: existingService._id,
      testType: 'Urinalysis',
      sampleId: 'LAB-002-2024',
      sampleDate: new Date(),
      results: new Map([
        ['color', 'Yellow'],
        ['clarity', 'Clear'],
        ['specific_gravity', '1.020'],
        ['protein', 'Negative'],
        ['glucose', 'Negative']
      ]),
      status: 'completed',
      completedAt: new Date(),
      notes: 'Normal urinalysis results',
      createdBy: receptionist._id
    });

    // Check if test results already exist
    const existingResults = await TestResult.find({
      $or: [
        { sampleId: 'LAB-001-2024' },
        { sampleId: 'LAB-002-2024' }
      ]
    });

    if (existingResults.length === 0) {
      await TestResult.insertMany([testResult1, testResult2]);
      console.log('✅ Created 2 test results');
    } else {
      console.log('ℹ️ Test results already exist');
    }

    console.log('🎉 Test data seeding completed!');
    console.log('📊 Summary:');
    console.log(`- Registered patient: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`- Walk-in patient: Maria Garcia`);
    console.log(`- Test results: 2 completed tests ready for review`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedTestData();