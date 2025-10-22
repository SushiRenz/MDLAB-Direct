const { validationResult } = require('express-validator');
const User = require('../models/User');
const Log = require('../models/Log');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    address,
    role = 'patient'
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmailOrUsername(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or username already exists'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    address,
    role
  });

  // Log user registration
  await Log.logUserAction(
    'User Registration',
    `New user registered: ${firstName} ${lastName} (${email}) with role: ${role}`,
    email,
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { userId: user._id, role, registrationTime: new Date() }
  );

  // Send token response
  await sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { identifier, password } = req.body; // identifier can be email or username
  console.log(`Login attempt for: ${identifier}`);

  // Check if user exists
  const user = await User.findByEmailOrUsername(identifier);
  
  if (!user) {
    console.log(`User not found: ${identifier}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    console.log(`Account locked: ${identifier}`);
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    console.log(`Account inactive: ${identifier}`);
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated. Please contact administrator.'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    console.log(`Invalid password for: ${identifier}`);
    // Increment login attempts
    await user.incLoginAttempts();
    
    // Log failed login attempt
    await Log.logAuthentication(
      'Failed Login Attempt',
      `Invalid password for user: ${identifier}`,
      user.email,
      req.ip || req.connection.remoteAddress || '127.0.0.1',
      'failed',
      { loginAttempts: user.loginAttempts + 1, identifier }
    );
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  console.log(`Login successful for: ${identifier}`);
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Log successful login
  await Log.logAuthentication(
    'User Login',
    `Successful login: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`,
    user.email,
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { userId: user._id, role: user.role, loginTime: new Date() }
  );

  // Send token response (this will invalidate any previous session)
  await sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  try {
    // Log logout activity
    await Log.logAuthentication(
      'User Logout',
      `User logged out: ${req.user.firstName} ${req.user.lastName} (${req.user.email})`,
      req.user.email,
      req.ip || req.connection.remoteAddress || '127.0.0.1',
      'success',
      { userId: req.user._id, logoutTime: new Date() }
    );

    // Clear the user's active session
    await req.user.clearSession();
    console.log(`Session cleared for user: ${req.user.username}`);
  } catch (error) {
    console.error('Error clearing session:', error);
    // Continue with logout even if session clearing fails
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      age: user.age,
      profilePic: user.profilePic,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const fieldsToUpdate = {};
  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'address',
    'dateOfBirth',
    'gender'
  ];

  // Only update allowed fields that are provided
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      age: user.age,
      profilePic: user.profilePic,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id);

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.passwordHash = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};
