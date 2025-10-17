const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');

async function testAppointmentData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');

    // Find a patient and a service for testing
    const patient = await User.findOne({ role: 'patient' });
    const service = await Service.findOne();

    if (!patient) {
      console.log('No patient found');
      return;
    }

    if (!service) {
      console.log('No service found');
      return;
    }

    console.log('\n=== PATIENT DATA FOR APPOINTMENT ===');
    console.log('Patient ID:', patient._id);
    console.log('Full Name:', patient.firstName, patient.lastName);
    console.log('Virtual fullName:', patient.fullName);
    console.log('Email:', patient.email);
    console.log('Phone:', patient.phone);
    console.log('Date of Birth:', patient.dateOfBirth);
    console.log('Virtual Age:', patient.age);
    console.log('Gender:', patient.gender);
    console.log('Address Object:', patient.address);
    
    // Format address like the controller will
    const formattedAddress = patient.address ? 
      [patient.address.street, patient.address.city, patient.address.province, patient.address.zipCode]
      .filter(Boolean).join(', ') : '';
    console.log('Formatted Address:', formattedAddress);
    
    // Format gender like the controller will
    const formattedSex = patient.gender ? 
      patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase() : null;
    console.log('Formatted Sex:', formattedSex);

    console.log('\n=== SERVICE DATA ===');
    console.log('Service ID:', service._id);
    console.log('Service Name:', service.serviceName);
    console.log('Price:', service.price);

    // Test appointment data that would be created
    const appointmentData = {
      patient: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      contactNumber: patient.phone || '',
      email: patient.email || '',
      address: formattedAddress,
      age: patient.age || null,
      sex: formattedSex,
      serviceName: service.serviceName,
      appointmentDate: new Date('2025-01-20'),
      appointmentTime: '10:00 AM',
      type: 'scheduled',
      status: 'pending'
    };

    console.log('\n=== APPOINTMENT DATA TO BE CREATED ===');
    console.log(JSON.stringify(appointmentData, null, 2));

    console.log('\n=== API CALL TEST ===');
    
    // Simulate API call data
    const apiData = {
      patientId: patient._id,
      serviceIds: [service._id],
      appointmentDate: '2025-01-20',
      appointmentTime: '10:00 AM'
    };
    
    console.log('API call data:', JSON.stringify(apiData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

testAppointmentData();