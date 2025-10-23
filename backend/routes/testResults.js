const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Add User model import
const {
  getTestResults,
  getTestResult,
  getTestResultsByAppointment,
  createTestResult,
  updateTestResult,
  deleteTestResult,
  releaseTestResult,
  markAsViewed,
  getTestResultStats
} = require('../controllers/testResultController');

// Validation middleware
const validateCreateTestResult = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .custom((value) => {
      // Allow either MongoDB ObjectId (for registered patients) or any string (for walk-in patients)
      if (typeof value === 'string' && value.trim() !== '') {
        return true;
      }
      throw new Error('Patient ID must be a non-empty string');
    }),
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('testType')
    .notEmpty()
    .withMessage('Test type is required')
    .trim(),
  body('results')
    .isObject()
    .withMessage('Results must be an object')
    .custom((value) => {
      if (Object.keys(value).length === 0) {
        throw new Error('Results cannot be empty');
      }
      return true;
    }),
  body('appointmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'reviewed', 'released', 'rejected'])
    .withMessage('Invalid status'),
  body('sampleDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid sample date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('medTechNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Med tech notes must not exceed 1000 characters'),
  body('pathologistNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Pathologist notes must not exceed 1000 characters')
];

const validateUpdateTestResult = [
  body('results')
    .optional()
    .isObject()
    .withMessage('Results must be an object'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'reviewed', 'released', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('medTechNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Med tech notes must not exceed 1000 characters'),
  body('pathologistNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Pathologist notes must not exceed 1000 characters'),
  body('qcPassed')
    .optional()
    .isBoolean()
    .withMessage('QC passed must be a boolean'),
  body('qcNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('QC notes must not exceed 500 characters'),
  body('medTech')
    .optional()
    .isMongoId()
    .withMessage('Invalid med tech ID'),
  body('pathologist')
    .optional()
    .isMongoId()
    .withMessage('Invalid pathologist ID'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters')
];

const validateGetTestResults = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .custom((value) => {
      const validStatuses = ['pending', 'in-progress', 'completed', 'reviewed', 'released', 'rejected'];
      if (Array.isArray(value)) {
        return value.every(status => validStatuses.includes(status));
      }
      return validStatuses.includes(value);
    })
    .withMessage('Invalid status value(s)'),
  query('testType')
    .optional()
    .trim(),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID'),
  query('patientName')
    .optional()
    .trim(),
  query('sampleId')
    .optional()
    .trim(),
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid from date'),
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid to date'),
  query('isAbnormal')
    .optional()
    .isBoolean()
    .withMessage('isAbnormal must be a boolean'),
  query('isCritical')
    .optional()
    .isBoolean()
    .withMessage('isCritical must be a boolean'),
  query('isNew')
    .optional()
    .isBoolean()
    .withMessage('isNew must be a boolean'),
  query('medTech')
    .optional()
    .isMongoId()
    .withMessage('Invalid med tech ID'),
  query('pathologist')
    .optional()
    .isMongoId()
    .withMessage('Invalid pathologist ID'),
  query('sortBy')
    .optional()
    .isIn(['sampleDate', 'completedDate', 'releasedDate', 'testType', 'status', 'patientName', 'sampleId'])
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

const validateStatsQuery = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Period must be day, week, or month')
];

// Routes

// @route   GET /api/test-results
// @desc    Get all test results with filtering and pagination
// @access  Private (MedTech only)
router.get('/', 
  (req, res, next) => {
    console.log('🚀 ROUTE DEBUG - GET /api/test-results hit with query:', req.query);
    console.log('🚀 ROUTE DEBUG - User:', req.user ? `${req.user.role} (${req.user._id})` : 'No user');
    next();
  },
  auth.protect, 
  auth.authorize('medtech'), 
  validateGetTestResults, 
  getTestResults
);

// @route   GET /api/test-results/debug/auth
// @desc    Debug authentication status
// @access  Private (Any authenticated user)
router.get('/debug/auth', auth.protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      isActive: req.user.isActive
    },
    canAccessReviewResults: req.user.role === 'medtech',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/test-results/my
// @desc    Get patient's own released test results
// @access  Private (Patient only)
router.get('/my', 
  auth.protect, 
  auth.authorize('patient'), 
  async (req, res) => {
    try {
      // Find test results that have been released to this patient
      const TestResult = require('../models/TestResult');
      const mongoose = require('mongoose');
      
      console.log('🔍 Fetching results for patient ID:', req.user.id);
      
      // Get current user info for better matching
      const currentUser = await User.findById(req.user.id);
      console.log('📧 Current user email:', currentUser?.email);
      
      // Query for released test results belonging to this patient
      // Handle multiple formats: ObjectId, string ObjectId, and email
      const queryConditions = [
        { patient: req.user.id }, // Direct ObjectId match
        { patient: new mongoose.Types.ObjectId(req.user.id) }, // Mongoose ObjectId match
        { patient: req.user.id.toString() } // String ObjectId match
      ];
      
      // Also match by email if available (for cases where email was stored as patient field)
      if (currentUser?.email) {
        queryConditions.push({ patient: currentUser.email });
      }
      
      const testResults = await TestResult.find({
        $and: [
          { $or: queryConditions },
          { status: 'released' },
          { patient: { $ne: null, $ne: undefined } }, // Exclude corrupted patient fields
          { isDeleted: { $ne: true } } // Exclude soft-deleted results
        ]
      })
      .populate('patient', 'firstName lastName email phone')
      .populate('appointment', 'services appointmentDate')
      .populate('service', 'serviceName category')
      .sort({ releasedDate: -1 })
      .select('-__v');

      console.log(`📊 Found ${testResults.length} released results for patient`);
      
      // Debug each result
      testResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.testType} - Patient: ${result.patient?.firstName} ${result.patient?.lastName}`);
      });

      res.status(200).json({
        success: true,
        message: 'Test results retrieved successfully',
        data: testResults,
        count: testResults.length
      });
    } catch (error) {
      console.error('❌ Error fetching patient test results:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching test results',
        error: error.message
      });
    }
  }
);

// @route   GET /api/test-results/stats
// @desc    Get test result statistics
// @access  Private (Staff only)
router.get('/stats', auth.protect, auth.staffOnly, validateStatsQuery, getTestResultStats);

// @route   GET /api/test-results/appointment/:appointmentId
// @desc    Get all test results for a specific appointment
// @access  Private (Staff only)
router.get('/appointment/:appointmentId', auth.protect, auth.staffOnly, getTestResultsByAppointment);

// @route   GET /api/test-results/:id
// @desc    Get single test result by ID
// @access  Private
router.get('/:id', auth.protect, validateIdParam, getTestResult);

// @route   POST /api/test-results
// @desc    Create new test result
// @access  Private (MedTech, Pathologist, Admin)
router.post('/', auth.protect, auth.staffOnly, validateCreateTestResult, createTestResult);

// @route   PUT /api/test-results/:id/release
// @desc    Release test result to patient
// @access  Private (MedTech, Pathologist, Admin)
router.put('/:id/release', 
  auth.protect, 
  (req, res, next) => {
    console.log('🔍 RELEASE ROUTE HIT - DEBUG INFO:');
    console.log('- User ID:', req.user?._id);
    console.log('- User role:', req.user?.role);
    console.log('- User email:', req.user?.email);
    console.log('- Test result ID:', req.params.id);
    console.log('- Timestamp:', new Date().toISOString());
    next();
  },
  auth.authorize('medtech', 'pathologist', 'admin'), 
  validateIdParam, 
  releaseTestResult
);

// @route   PUT /api/test-results/:id/mark-viewed
// @desc    Mark test result as viewed by patient
// @access  Private (Patient only)
router.put('/:id/mark-viewed', auth.protect, validateIdParam, markAsViewed);

// @route   PUT /api/test-results/:id/approve
// @desc    Approve test result (move from completed to reviewed) - MedTech only
// @access  Private (MedTech only)
router.put('/:id/approve', auth.protect, auth.authorize('medtech'), validateIdParam, 
  [
    body('pathologistNotes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must not exceed 1000 characters')
  ], 
  require('../controllers/testResultController').approveTestResult
);

// @route   PUT /api/test-results/:id/reject
// @desc    Reject test result (move from completed back to pending) - MedTech only
// @access  Private (MedTech only)
router.put('/:id/reject', auth.protect, auth.authorize('medtech'), validateIdParam,
  [
    body('rejectionReason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Rejection reason must not exceed 500 characters')
  ],
  require('../controllers/testResultController').rejectTestResult
);

// @route   PUT /api/test-results/:id
// @desc    Update test result
// @access  Private (MedTech, Pathologist, Admin)
router.put('/:id', auth.protect, auth.staffOnly, validateIdParam, validateUpdateTestResult, updateTestResult);

// @route   DELETE /api/test-results/:id
// @desc    Delete test result (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth.protect, auth.adminOnly, validateIdParam, deleteTestResult);

module.exports = router;