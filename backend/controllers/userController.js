const { validationResult } = require('express-validator');
const User = require('../models/User');
const Log = require('../models/Log');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  
  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }
  
  // Filter by active status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }
  
  // Search by name, username, or email
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { username: searchRegex },
      { email: searchRegex }
    ];
  }

  // Execute query
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .select('-passwordHash');

  // Get total count
  const total = await User.countDocuments(query);

  // Pagination result
  const pagination = {};
  
  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination,
    users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
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
    role,
    address,
    dateOfBirth,
    gender
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
    passwordHash: password,
    firstName,
    lastName,
    phone,
    role,
    address,
    dateOfBirth,
    gender
  });

  // Log user creation by admin
  await Log.logUserAction(
    'User Creation',
    `Admin created new user: ${firstName} ${lastName} (${email}) with role: ${role}`,
    req.user?.email || 'admin',
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { 
      createdUserId: user._id, 
      createdUserRole: role, 
      adminId: req.user?._id,
      creationTime: new Date() 
    }
  );

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const fieldsToUpdate = {};
  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'role',
    'address',
    'dateOfBirth',
    'gender',
    'isActive'
  ];

  // Only update allowed fields that are provided
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  user = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-passwordHash');

  // Log user update by admin
  await Log.logUserAction(
    'User Update',
    `Admin updated user: ${user.firstName} ${user.lastName} (${user.email}) - Fields: ${Object.keys(fieldsToUpdate).join(', ')}`,
    req.user?.email || 'admin',
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { 
      updatedUserId: user._id, 
      updatedFields: Object.keys(fieldsToUpdate),
      adminId: req.user?._id,
      updateTime: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't allow deletion of the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last active admin user'
      });
    }
  }

  await User.findByIdAndDelete(req.params.id);

  // Log user deletion by admin
  await Log.logUserAction(
    'User Deletion',
    `Admin deleted user: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`,
    req.user?.email || 'admin',
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { 
      deletedUserId: user._id, 
      deletedUserRole: user.role,
      adminId: req.user?._id,
      deletionTime: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't allow deactivation of the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate the last active admin user'
      });
    }
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    {
      new: true,
      runValidators: true
    }
  ).select('-passwordHash');

  // Log user deactivation by admin
  await Log.logUserAction(
    'User Deactivation',
    `Admin deactivated user: ${user.firstName} ${user.lastName} (${user.email})`,
    req.user?.email || 'admin',
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { 
      deactivatedUserId: user._id, 
      adminId: req.user?._id,
      deactivationTime: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    user
  });
});

// @desc    Activate user
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
const activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    {
      new: true,
      runValidators: true
    }
  ).select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Log user activation by admin
  await Log.logUserAction(
    'User Activation',
    `Admin activated user: ${user.firstName} ${user.lastName} (${user.email})`,
    req.user?.email || 'admin',
    req.ip || req.connection.remoteAddress || '127.0.0.1',
    'success',
    { 
      activatedUserId: user._id, 
      adminId: req.user?._id,
      activationTime: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
    user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.getUserStats();
  
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  res.status(200).json({
    success: true,
    stats: {
      total: totalUsers,
      active: activeUsers,
      recent: recentUsers,
      byRole: stats
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats
};
