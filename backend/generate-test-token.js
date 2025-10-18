const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

async function generateTestToken() {
  try {
    console.log('🔑 Generating test authentication token...');
    
    // Find a receptionist user
    const user = await User.findOne({ role: 'receptionist' });
    
    if (!user) {
      console.error('❌ No receptionist user found');
      process.exit(1);
    }
    
    console.log('👤 Found user:', user.firstName, user.lastName, `(${user.email})`);
    
    // Generate JWT token using the same secret as the application
    const JWT_SECRET = process.env.JWT_SECRET || 'mdlab_direct_jwt_secret_key_2024_secure';
    
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { 
        expiresIn: '24h' 
      }
    );
    
    console.log('\n✅ Generated JWT Token:');
    console.log('━'.repeat(60));
    console.log(token);
    console.log('━'.repeat(60));
    
    console.log('\n📋 To use this token:');
    console.log('1. Open your browser console');
    console.log('2. Run: localStorage.setItem("token", "' + token + '")');
    console.log('3. Refresh the Review Results page');
    console.log('4. The API calls should now work!');
    
    // Also save to user's current session token for validation
    user.currentSessionToken = token;
    await user.save();
    
    console.log('\n✅ Token saved to user session. Token is valid for 24 hours.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating token:', error);
    process.exit(1);
  }
}

generateTestToken();