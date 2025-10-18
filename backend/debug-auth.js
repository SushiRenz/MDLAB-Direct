const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function debugAuthIssue() {
    try {
        console.log('🔍 Debugging authentication issue...');
        await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
        
        // Find the receptionist user
        const user = await User.findOne({ email: 'receptionist@mdlab.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('👤 User found:', user.email);
        console.log('🔓 User active:', user.isActive);
        console.log('🎯 Current session token:', user.currentSessionToken ? 'EXISTS' : 'NULL');
        console.log('⏰ Session expiry:', user.sessionExpiry);
        
        // Generate a test token the same way the system does
        const testToken = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            { expiresIn: '24h' }
        );
        
        console.log('🔑 Generated test token:', testToken.substring(0, 50) + '...');
        
        // Check if this token would be valid
        const isValid = user.isSessionValid(testToken);
        console.log('✅ Token valid according to user method:', isValid);
        
        // Try updating the user's session to match our token
        user.currentSessionToken = testToken;
        user.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();
        
        console.log('💾 Updated user session token');
        console.log('🎯 New token for use:', testToken);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

debugAuthIssue();