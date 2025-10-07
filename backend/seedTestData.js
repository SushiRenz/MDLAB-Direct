const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mdlab_direct', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedTestData = async () => {
  try {
    console.log('Starting to seed test data...');

    // Create a test admin/receptionist user for createdBy
    let testReceptionist = await User.findOne({ email: 'test.receptionist@mdlab.com' });
    if (!testReceptionist) {
      console.log('Creating test receptionist...');
      testReceptionist = new User({
        username: 'test.receptionist',
        email: 'test.receptionist@mdlab.com',
        passwordHash: 'password123',
        firstName: 'Test',
        lastName: 'Receptionist',
        role: 'receptionist',
        contactNumber: '+639000000000',
        isActive: true
      });
      await testReceptionist.save();
      console.log('Test receptionist created');
    }

    // Create some test patients if they don't exist
    const existingPatients = await User.find({ role: 'patient' });
    
    if (existingPatients.length === 0) {
      console.log('Creating test patients...');
      const testPatients = [
        {
          username: 'maria.santos',
          email: 'maria.santos@email.com',
          passwordHash: 'password123',
          firstName: 'Maria',
          lastName: 'Santos',
          role: 'patient',
          contactNumber: '+639123456789',
          isActive: true
        },
        {
          username: 'juan.dela.cruz',
          email: 'juan.delacruz@email.com',
          passwordHash: 'password123',
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          role: 'patient',
          contactNumber: '+639234567890',
          isActive: true
        },
        {
          username: 'ana.mendoza',
          email: 'ana.mendoza@email.com',
          passwordHash: 'password123',
          firstName: 'Ana',
          lastName: 'Mendoza',
          role: 'patient',
          contactNumber: '+639345678901',
          isActive: true
        }
      ];

      for (let patientData of testPatients) {
        const patient = new User(patientData);
        await patient.save();
        console.log(`Created patient: ${patient.firstName} ${patient.lastName}`);
      }
    }

    // Get existing services
    const services = await Service.find({ isActive: true });
    if (services.length === 0) {
      console.log('No services found. Please create services first.');
      return;
    }

    // Get all patients and update them with contact numbers if missing
    const patients = await User.find({ role: 'patient' });
    console.log('Found patients:', patients.map(p => ({ name: `${p.firstName} ${p.lastName}`, contact: p.contactNumber })));
    
    if (patients.length === 0) {
      console.log('No patients found. Cannot create appointments.');
      return;
    }

    // Update patients without contact numbers
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      let needsUpdate = false;
      
      if (!patient.contactNumber) {
        patient.contactNumber = `+63912345${String(i + 1).padStart(4, '0')}`;
        needsUpdate = true;
      }
      
      // Fix gender if it's empty string
      if (patient.gender === '') {
        patient.gender = undefined; // Let it be null instead of empty string
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await patient.save();
        console.log(`Updated ${patient.firstName} ${patient.lastName} with contact number: ${patient.contactNumber}`);
      }
    }
    
    // Create test appointments for today and upcoming days
    const today = new Date();
    const testAppointments = [];

    // Today's appointments
    for (let i = 0; i < 5; i++) {
      const patient = patients[i % patients.length];
      const service = services[i % services.length];
      
      testAppointments.push({
        patientName: `${patient.firstName} ${patient.lastName}`,
        contactNumber: patient.contactNumber,
        email: patient.email,
        patient: patient._id,
        service: service._id,
        serviceName: service.serviceName,
        appointmentDate: today,
        appointmentTime: `${9 + (i * 2)}:00 AM`,
        status: i < 2 ? 'completed' : i < 4 ? 'pending' : 'confirmed',
        priority: 'regular',
        type: i === 4 ? 'walk-in' : 'scheduled',
        reasonForVisit: `Regular checkup and ${service.serviceName}`,
        notes: `Test appointment created on ${new Date().toISOString()}`,
        createdBy: testReceptionist._id,
        createdByName: `${testReceptionist.firstName} ${testReceptionist.lastName}`,
        appointmentId: `APT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`
      });
    }

    // Upcoming appointments
    for (let day = 1; day <= 3; day++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + day);
      
      for (let i = 0; i < 2; i++) {
        const patient = patients[i % patients.length];
        const service = services[i % services.length];
        
        testAppointments.push({
          patientName: `${patient.firstName} ${patient.lastName}`,
          contactNumber: patient.contactNumber,
          email: patient.email,
          patient: patient._id,
          service: service._id,
          serviceName: service.serviceName,
          appointmentDate: futureDate,
          appointmentTime: `${10 + (i * 3)}:00 AM`,
          status: 'confirmed',
          priority: 'regular',
          type: 'scheduled',
          reasonForVisit: `Scheduled ${service.serviceName}`,
          notes: `Future appointment for ${futureDate.toDateString()}`,
          createdBy: testReceptionist._id,
          createdByName: `${testReceptionist.firstName} ${testReceptionist.lastName}`,
          appointmentId: `APT-${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(day * 10 + i + 1).padStart(3, '0')}`
        });
      }
    }

    // Insert appointments
    console.log('Creating test appointments...');
    for (let appointmentData of testAppointments) {
      const existingAppointment = await Appointment.findOne({
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime
      });

      if (!existingAppointment) {
        const appointment = new Appointment(appointmentData);
        await appointment.save();
        console.log(`Created appointment for ${appointment.patientName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}`);
      }
    }

    console.log('Test data seeding completed!');
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedTestData();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

runSeed();