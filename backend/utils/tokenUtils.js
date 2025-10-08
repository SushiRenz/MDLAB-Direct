const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send token response
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_EXPIRE?.replace('d', '')) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const expiryDate = new Date(
    Date.now() + (parseInt(process.env.JWT_EXPIRE?.replace('d', '')) || 7) * 24 * 60 * 60 * 1000
  );

  try {
    // Clear any existing session for this user (single session per user)
    if (user.currentSessionToken) {
      console.log(`Invalidating previous session for user: ${user.username}`);
    }
    
    // Set new active session
    await user.setActiveSession(token, expiryDate);
    
    console.log(`New session created for user: ${user.username}, expires: ${expiryDate}`);
  } catch (error) {
    console.error('Error setting active session:', error);
    // Continue with login even if session tracking fails
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profilePic: user.profilePic,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
