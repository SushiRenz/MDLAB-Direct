const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

async function testAPIWithAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('📡 Connected to MongoDB');
    
    // Get a medtech user for authentication
    const medtechUser = await User.findOne({ role: 'medtech' });
    if (!medtechUser) {
      console.log('❌ No medtech user found');
      return;
    }
    
    console.log(`🔐 Using medtech user: ${medtechUser.firstName} ${medtechUser.lastName} (${medtechUser.username})`);
    
    // Create a token for the medtech user
    const token = jwt.sign(
      { 
        userId: medtechUser._id,
        role: medtechUser.role,
        username: medtechUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🎫 Generated token for medtech user');
    console.log('🔑 Using JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Missing');
    
    // Test the API with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n1. Testing /api/appointments with medtech auth...');
    try {
      const allResponse = await axios.get('http://localhost:5000/api/appointments', { headers });
      console.log('✅ All appointments:', {
        success: allResponse.data.success,
        count: allResponse.data.data?.appointments?.length || 0,
        message: allResponse.data.message
      });
    } catch (error) {
      console.log('❌ All appointments error:', error.response?.data || error.message);
    }
    
    console.log('\n2. Testing /api/appointments?status=checked-in with medtech auth...');
    try {
      const checkedInResponse = await axios.get('http://localhost:5000/api/appointments?status=checked-in', { headers });
      console.log('✅ Checked-in appointments:', {
        success: checkedInResponse.data.success,
        count: checkedInResponse.data.data?.appointments?.length || 0,
        appointments: checkedInResponse.data.data?.appointments?.map(a => ({
          id: a.appointmentId,
          patient: a.patientName,
          status: a.status
        })) || []
      });
    } catch (error) {
      console.log('❌ Checked-in appointments error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAPIWithAuth();