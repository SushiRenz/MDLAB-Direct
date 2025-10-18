const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const auth = require('../middleware/auth');
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
    .isIn(['pending', 'in-progress', 'completed', 'reviewed', 'released'])
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
    .isIn(['pending', 'in-progress', 'completed', 'reviewed', 'released'])
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
    .withMessage('Invalid pathologist ID')
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
      const validStatuses = ['pending', 'in-progress', 'completed', 'reviewed', 'released'];
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
// @access  Private (All authenticated users)
router.get('/', 
  (req, res, next) => {
    console.log('🚀 ROUTE DEBUG - GET /api/test-results hit with query:', req.query);
    console.log('🚀 ROUTE DEBUG - User:', req.user ? `${req.user.role} (${req.user._id})` : 'No user');
    next();
  },
  auth.protect, 
  auth.staffOnly, 
  validateGetTestResults, 
  getTestResults
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

// @route   PUT /api/test-results/:id
// @desc    Update test result
// @access  Private (MedTech, Pathologist, Admin)
router.put('/:id', auth.protect, auth.staffOnly, validateIdParam, validateUpdateTestResult, updateTestResult);

// @route   DELETE /api/test-results/:id
// @desc    Delete test result (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth.protect, auth.adminOnly, validateIdParam, deleteTestResult);

// @route   PUT /api/test-results/:id/release
// @desc    Release test result to patient
// @access  Private (Pathologist, Admin)
router.put('/:id/release', auth.protect, auth.medicalOnly, validateIdParam, releaseTestResult);

// @route   PUT /api/test-results/:id/mark-viewed
// @desc    Mark test result as viewed by patient
// @access  Private (Patient only)
router.put('/:id/mark-viewed', auth.protect, validateIdParam, markAsViewed);

module.exports = router;