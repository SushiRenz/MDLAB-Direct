const { validationResult } = require('express-validator');
const MobileLabSchedule = require('../models/MobileLabSchedule');
const Service = require('../models/Service');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all mobile lab schedules with filtering
// @route   GET /api/mobile-lab
// @access  Private (All authenticated users can view)
const getMobileLabSchedules = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 20,
    dayOfWeek,
    status,
    municipality,
    barangay,
    isActive,
    sortBy = 'dayOfWeek',
    sortOrder = 'asc'
  } = req.query;

  // Build query object
  let query = { isDeleted: false };

  // Apply filters
  if (dayOfWeek !== undefined) {
    query.dayOfWeek = parseInt(dayOfWeek);
  }

  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  if (municipality) {
    query['location.municipality'] = { $regex: municipality, $options: 'i' };
  }

  if (barangay) {
    query['location.barangay'] = { $regex: barangay, $options: 'i' };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Get total count
  const total = await MobileLabSchedule.countDocuments(query);

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const schedules = await MobileLabSchedule.find(query)
    .populate('availableServices', 'serviceName price category')
    .populate('assignedTeam.medTech', 'firstName lastName email')
    .populate('assignedTeam.driver', 'firstName lastName email')
    .populate('assignedTeam.coordinator', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Calculate pagination
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(200).json({
    success: true,
    message: 'Mobile lab schedules retrieved successfully',
    data: schedules,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalResults: total,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    }
  });
});

// @desc    Get current week's mobile lab schedule
// @route   GET /api/mobile-lab/current-week
// @access  Public
const getCurrentWeekSchedule = asyncHandler(async (req, res) => {
  const schedules = await MobileLabSchedule.getCurrentWeekSchedule();

  res.status(200).json({
    success: true,
    message: 'Current week schedule retrieved successfully',
    data: schedules
  });
});

// @desc    Get currently active mobile lab location
// @route   GET /api/mobile-lab/current-active
// @access  Public
const getCurrentActiveLocation = asyncHandler(async (req, res) => {
  const activeLocation = await MobileLabSchedule.getCurrentActiveLocation();

  if (!activeLocation) {
    return res.status(404).json({
      success: false,
      message: 'No active mobile lab location found for today'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Current active location retrieved successfully',
    data: activeLocation
  });
});

// @desc    Get next scheduled mobile lab location
// @route   GET /api/mobile-lab/next-location
// @access  Public
const getNextLocation = asyncHandler(async (req, res) => {
  const nextLocation = await MobileLabSchedule.getNextLocation();

  if (!nextLocation) {
    return res.status(404).json({
      success: false,
      message: 'No upcoming mobile lab locations found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Next scheduled location retrieved successfully',
    data: nextLocation
  });
});

// @desc    Get single mobile lab schedule by ID
// @route   GET /api/mobile-lab/:id
// @access  Private
const getMobileLabSchedule = asyncHandler(async (req, res) => {
  const schedule = await MobileLabSchedule.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('availableServices', 'serviceName price category description')
    .populate('assignedTeam.medTech', 'firstName lastName email phone')
    .populate('assignedTeam.driver', 'firstName lastName email phone')
    .populate('assignedTeam.coordinator', 'firstName lastName email phone')
    .populate('createdBy', 'firstName lastName email')
    .populate('lastModifiedBy', 'firstName lastName email');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Mobile lab schedule not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Mobile lab schedule retrieved successfully',
    data: schedule
  });
});

// @desc    Create new mobile lab schedule
// @route   POST /api/mobile-lab
// @access  Private (Admin only)
const createMobileLabSchedule = asyncHandler(async (req, res) => {
  console.log('Received mobile lab schedule request:', JSON.stringify(req.body, null, 2));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check permission
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin can create mobile lab schedules.'
    });
  }

  const {
    dayOfWeek,
    location,
    timeSlot,
    status = 'Scheduled',
    availableServices = [],
    capacity,
    notes,
    contactInfo,
    assignedTeam,
    equipment = [],
    recurring,
    weatherDependent = true,
    priority = 'Medium'
  } = req.body;

  // Validate services exist
  if (availableServices.length > 0) {
    const services = await Service.find({ _id: { $in: availableServices } });
    if (services.length !== availableServices.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more services not found'
      });
    }
  }

  // Validate team members exist if provided
  if (assignedTeam) {
    for (const role in assignedTeam) {
      if (assignedTeam[role] && assignedTeam[role] !== '' && assignedTeam[role] !== 'undefined') {
        const user = await User.findById(assignedTeam[role]);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `${role} user not found`
          });
        }
      }
    }
  }

  // Check for duplicate schedule on the same day
  const existingSchedule = await MobileLabSchedule.findOne({
    dayOfWeek,
    isDeleted: false,
    isActive: true
  });

  if (existingSchedule) {
    return res.status(409).json({
      success: false,
      message: `A mobile lab schedule already exists for ${existingSchedule.dayName}`
    });
  }

  // Create schedule
  const schedule = new MobileLabSchedule({
    dayOfWeek,
    location,
    timeSlot,
    status,
    availableServices,
    capacity,
    notes,
    contactInfo,
    assignedTeam,
    equipment,
    recurring,
    weatherDependent,
    priority,
    createdBy: req.user._id
  });

  await schedule.save();

  // Populate the created schedule
  await schedule.populate([
    {
      path: 'availableServices',
      select: 'serviceName price category'
    },
    {
      path: 'assignedTeam.medTech',
      select: 'firstName lastName email'
    },
    {
      path: 'assignedTeam.driver',
      select: 'firstName lastName email'
    },
    {
      path: 'assignedTeam.coordinator',
      select: 'firstName lastName email'
    },
    {
      path: 'createdBy',
      select: 'firstName lastName'
    }
  ]);

  res.status(201).json({
    success: true,
    message: 'Mobile lab schedule created successfully',
    data: schedule
  });
});

// @desc    Update mobile lab schedule
// @route   PUT /api/mobile-lab/:id
// @access  Private (Admin only)
const updateMobileLabSchedule = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check permission
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin can update mobile lab schedules.'
    });
  }

  const schedule = await MobileLabSchedule.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Mobile lab schedule not found'
    });
  }

  const {
    dayOfWeek,
    location,
    timeSlot,
    status,
    availableServices,
    capacity,
    notes,
    contactInfo,
    assignedTeam,
    equipment,
    recurring,
    weatherDependent,
    priority,
    isActive
  } = req.body;

  // Validate services exist if provided
  if (availableServices && availableServices.length > 0) {
    const services = await Service.find({ _id: { $in: availableServices } });
    if (services.length !== availableServices.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more services not found'
      });
    }
  }

  // Validate team members exist if provided
  if (assignedTeam) {
    for (const role in assignedTeam) {
      if (assignedTeam[role]) {
        const user = await User.findById(assignedTeam[role]);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `${role} user not found`
          });
        }
      }
    }
  }

  // Check for duplicate schedule on the same day (excluding current schedule)
  if (dayOfWeek !== undefined && dayOfWeek !== schedule.dayOfWeek) {
    const existingSchedule = await MobileLabSchedule.findOne({
      dayOfWeek,
      _id: { $ne: schedule._id },
      isDeleted: false,
      isActive: true
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message: `A mobile lab schedule already exists for the selected day`
      });
    }
  }

  // Update fields
  if (dayOfWeek !== undefined) schedule.dayOfWeek = dayOfWeek;
  if (location) schedule.location = { ...schedule.location, ...location };
  if (timeSlot) schedule.timeSlot = { ...schedule.timeSlot, ...timeSlot };
  if (status) schedule.status = status;
  if (availableServices) schedule.availableServices = availableServices;
  if (capacity) schedule.capacity = { ...schedule.capacity, ...capacity };
  if (notes !== undefined) schedule.notes = notes;
  if (contactInfo) schedule.contactInfo = { ...schedule.contactInfo, ...contactInfo };
  if (assignedTeam) schedule.assignedTeam = { ...schedule.assignedTeam, ...assignedTeam };
  if (equipment) schedule.equipment = equipment;
  if (recurring) schedule.recurring = { ...schedule.recurring, ...recurring };
  if (weatherDependent !== undefined) schedule.weatherDependent = weatherDependent;
  if (priority) schedule.priority = priority;
  if (isActive !== undefined) schedule.isActive = isActive;

  schedule.lastModifiedBy = req.user._id;

  await schedule.save();

  // Populate the updated schedule
  await schedule.populate([
    {
      path: 'availableServices',
      select: 'serviceName price category'
    },
    {
      path: 'assignedTeam.medTech',
      select: 'firstName lastName email'
    },
    {
      path: 'assignedTeam.driver',
      select: 'firstName lastName email'
    },
    {
      path: 'assignedTeam.coordinator',
      select: 'firstName lastName email'
    },
    {
      path: 'lastModifiedBy',
      select: 'firstName lastName'
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Mobile lab schedule updated successfully',
    data: schedule
  });
});

// @desc    Delete mobile lab schedule (soft delete)
// @route   DELETE /api/mobile-lab/:id
// @access  Private (Admin only)
const deleteMobileLabSchedule = asyncHandler(async (req, res) => {
  // Check permission
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin can delete mobile lab schedules.'
    });
  }

  const schedule = await MobileLabSchedule.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Mobile lab schedule not found'
    });
  }

  // Soft delete
  schedule.isDeleted = true;
  schedule.isActive = false;
  schedule.lastModifiedBy = req.user._id;
  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Mobile lab schedule deleted successfully'
  });
});

// @desc    Update mobile lab schedule status
// @route   PUT /api/mobile-lab/:id/status
// @access  Private (Admin, MedTech)
const updateScheduleStatus = asyncHandler(async (req, res) => {
  // Check permission
  if (!['admin', 'medtech'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin or medtech can update schedule status.'
    });
  }

  const { status } = req.body;

  if (!['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const schedule = await MobileLabSchedule.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Mobile lab schedule not found'
    });
  }

  schedule.status = status;
  schedule.lastModifiedBy = req.user._id;

  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Schedule status updated successfully',
    data: schedule
  });
});

// @desc    Update booking count for mobile lab schedule
// @route   PUT /api/mobile-lab/:id/booking-count
// @access  Private (Used internally when appointments are booked)
const updateBookingCount = asyncHandler(async (req, res) => {
  const { increment = 1 } = req.body;

  const schedule = await MobileLabSchedule.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Mobile lab schedule not found'
    });
  }

  await schedule.updateBookingCount(increment);

  res.status(200).json({
    success: true,
    message: 'Booking count updated successfully',
    data: {
      currentBookings: schedule.capacity.currentBookings,
      maxPatients: schedule.capacity.maxPatients,
      available: schedule.capacity.maxPatients - schedule.capacity.currentBookings
    }
  });
});

// @desc    Get mobile lab schedule statistics
// @route   GET /api/mobile-lab/stats
// @access  Private (Admin only)
const getMobileLabStats = asyncHandler(async (req, res) => {
  // Check permission
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin can view mobile lab statistics.'
    });
  }

  const stats = await MobileLabSchedule.aggregate([
    {
      $match: {
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalSchedules: { $sum: 1 },
        activeSchedules: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        scheduledLocations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0]
          }
        },
        activeLocations: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
          }
        },
        totalCapacity: { $sum: '$capacity.maxPatients' },
        totalBookings: { $sum: '$capacity.currentBookings' }
      }
    }
  ]);

  const result = stats[0] || {
    totalSchedules: 0,
    activeSchedules: 0,
    scheduledLocations: 0,
    activeLocations: 0,
    totalCapacity: 0,
    totalBookings: 0
  };

  // Calculate utilization percentage
  result.utilizationPercentage = result.totalCapacity > 0 
    ? ((result.totalBookings / result.totalCapacity) * 100).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    message: 'Mobile lab statistics retrieved successfully',
    data: result
  });
});

module.exports = {
  getMobileLabSchedules,
  getCurrentWeekSchedule,
  getCurrentActiveLocation,
  getNextLocation,
  getMobileLabSchedule,
  createMobileLabSchedule,
  updateMobileLabSchedule,
  deleteMobileLabSchedule,
  updateScheduleStatus,
  updateBookingCount,
  getMobileLabStats
};