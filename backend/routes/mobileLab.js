const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const {
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
} = require('../controllers/mobileLabController');

// Validation middleware
const validateCreateMobileLabSchedule = [
  body('dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be an integer between 0 and 6'),
  body('location.name')
    .notEmpty()
    .withMessage('Location name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location name must not exceed 200 characters'),
  body('location.address')
    .notEmpty()
    .withMessage('Location address is required')
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location address must not exceed 300 characters'),
  body('location.barangay')
    .notEmpty()
    .withMessage('Barangay is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barangay must not exceed 100 characters'),
  body('location.municipality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Municipality must not exceed 100 characters'),
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid float between -90 and 90'),
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid float between -180 and 180'),
  body('timeSlot.startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Start time cannot be empty'),
  body('timeSlot.endTime')
    .notEmpty()
    .withMessage('End time is required')
    .trim()
    .isLength({ min: 1 })
    .withMessage('End time cannot be empty'),
  body('timeSlot.timeDisplay')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Time display must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'])
    .withMessage('Invalid status value'),
  body('availableServices')
    .optional()
    .isArray()
    .withMessage('Available services must be an array'),
  body('availableServices.*')
    .optional()
    .isMongoId()
    .withMessage('Each service ID must be a valid MongoDB ObjectId'),
  body('capacity.maxPatients')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Max patients must be between 1 and 500'),
  body('capacity.currentBookings')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current bookings must be a non-negative integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('contactInfo.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('contactInfo.contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name must not exceed 100 characters'),
  body('assignedTeam.medTech')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('MedTech ID must be a valid MongoDB ObjectId'),
  body('assignedTeam.driver')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Driver ID must be a valid MongoDB ObjectId'),
  body('assignedTeam.coordinator')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Coordinator ID must be a valid MongoDB ObjectId'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Equipment name must not exceed 100 characters'),
  body('equipment.*.status')
    .optional()
    .isIn(['Available', 'In Use', 'Maintenance', 'Unavailable'])
    .withMessage('Invalid equipment status'),
  body('recurring.isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  body('recurring.frequency')
    .optional()
    .isIn(['Weekly', 'Bi-weekly', 'Monthly', 'One-time'])
    .withMessage('Invalid frequency value'),
  body('recurring.startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('recurring.endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('weatherDependent')
    .optional()
    .isBoolean()
    .withMessage('weatherDependent must be a boolean'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority value')
];

const validateUpdateMobileLabSchedule = [
  body('dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be an integer between 0 and 6'),
  body('location.name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location name must not exceed 200 characters'),
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location address must not exceed 300 characters'),
  body('location.barangay')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barangay must not exceed 100 characters'),
  body('location.municipality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Municipality must not exceed 100 characters'),
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid float between -90 and 90'),
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid float between -180 and 180'),
  body('timeSlot.startTime')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Start time cannot be empty if provided'),
  body('timeSlot.endTime')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('End time cannot be empty if provided'),
  body('timeSlot.timeDisplay')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Time display must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'])
    .withMessage('Invalid status value'),
  body('availableServices')
    .optional()
    .isArray()
    .withMessage('Available services must be an array'),
  body('availableServices.*')
    .optional()
    .isMongoId()
    .withMessage('Each service ID must be a valid MongoDB ObjectId'),
  body('capacity.maxPatients')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Max patients must be between 1 and 500'),
  body('capacity.currentBookings')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current bookings must be a non-negative integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validateGetMobileLabSchedules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be an integer between 0 and 6'),
  query('status')
    .optional()
    .custom((value) => {
      const validStatuses = ['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'];
      if (Array.isArray(value)) {
        return value.every(status => validStatuses.includes(status));
      }
      return validStatuses.includes(value);
    })
    .withMessage('Invalid status value(s)'),
  query('municipality')
    .optional()
    .trim(),
  query('barangay')
    .optional()
    .trim(),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['dayOfWeek', 'location.name', 'location.barangay', 'status', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'])
    .withMessage('Invalid status value')
];

const validateBookingCountUpdate = [
  body('increment')
    .optional()
    .isInt()
    .withMessage('Increment must be an integer')
];

// Routes

// @route   GET /api/mobile-lab
// @desc    Get all mobile lab schedules with filtering and pagination
// @access  Private (All authenticated users)
router.get('/', protect, validateGetMobileLabSchedules, getMobileLabSchedules);

// @route   GET /api/mobile-lab/current-week
// @desc    Get current week's mobile lab schedule
// @access  Public
router.get('/current-week', getCurrentWeekSchedule);

// @route   GET /api/mobile-lab/current-active
// @desc    Get currently active mobile lab location
// @access  Public
router.get('/current-active', getCurrentActiveLocation);

// @route   GET /api/mobile-lab/next-location
// @desc    Get next scheduled mobile lab location
// @access  Public
router.get('/next-location', getNextLocation);

// @route   GET /api/mobile-lab/stats
// @desc    Get mobile lab schedule statistics
// @access  Private (Admin only)
router.get('/stats', protect, adminOnly, getMobileLabStats);

// @route   GET /api/mobile-lab/:id
// @desc    Get single mobile lab schedule by ID
// @access  Private
router.get('/:id', protect, validateIdParam, getMobileLabSchedule);

// @route   POST /api/mobile-lab
// @desc    Create new mobile lab schedule
// @access  Private (Admin only)
router.post('/', protect, adminOnly, validateCreateMobileLabSchedule, createMobileLabSchedule);

// @route   PUT /api/mobile-lab/:id
// @desc    Update mobile lab schedule
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, validateIdParam, validateUpdateMobileLabSchedule, updateMobileLabSchedule);

// @route   DELETE /api/mobile-lab/:id
// @desc    Delete mobile lab schedule (soft delete)
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, validateIdParam, deleteMobileLabSchedule);

// @route   PUT /api/mobile-lab/:id/status
// @desc    Update mobile lab schedule status
// @access  Private (Admin, MedTech)
router.put('/:id/status', protect, staffOnly, validateIdParam, validateStatusUpdate, updateScheduleStatus);

// @route   PUT /api/mobile-lab/:id/booking-count
// @desc    Update booking count for mobile lab schedule
// @access  Private (Internal use)
router.put('/:id/booking-count', protect, validateIdParam, validateBookingCountUpdate, updateBookingCount);

module.exports = router;