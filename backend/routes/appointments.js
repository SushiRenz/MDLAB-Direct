const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  checkInPatient,
  checkOutPatient,
  getAppointmentStats,
  getTodayAppointments,
  assignMedicalStaff
} = require('../controllers/appointmentController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private (Admin, Receptionist, MedTech, Pathologist)
router.get('/stats', 
  authorize('admin', 'receptionist', 'medtech', 'pathologist'), 
  getAppointmentStats
);

// @route   GET /api/appointments/today
// @desc    Get today's appointments
// @access  Private (Admin, Receptionist, MedTech, Pathologist)
router.get('/today', 
  authorize('admin', 'receptionist', 'medtech', 'pathologist'), 
  getTodayAppointments
);

// @route   GET /api/appointments
// @desc    Get all appointments with filtering
// @access  Private (Admin, Receptionist, MedTech, Pathologist, Patient - own only)
router.get('/', getAppointments);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Admin, Receptionist, Patient)
router.post('/', 
  authorize('admin', 'receptionist', 'patient'),
  [
    body('patientName')
      .notEmpty()
      .withMessage('Patient name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Patient name must be between 2 and 100 characters'),
    
    body('contactNumber')
      .notEmpty()
      .withMessage('Contact number is required')
      .matches(/^(\+63|0)[0-9]{10}$/)
      .withMessage('Please provide a valid Philippine phone number'),
    
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('serviceId')
      .notEmpty()
      .withMessage('Service ID is required')
      .isMongoId()
      .withMessage('Please provide a valid service ID'),
    
    body('appointmentDate')
      .notEmpty()
      .withMessage('Appointment date is required')
      .isISO8601()
      .withMessage('Please provide a valid date'),
    
    body('appointmentTime')
      .notEmpty()
      .withMessage('Appointment time is required')
      .matches(/^(0?[1-9]|1[012]):[0-5][0-9] [AP]M$/)
      .withMessage('Please provide time in format HH:MM AM/PM'),
    
    body('type')
      .optional()
      .isIn(['scheduled', 'walk-in', 'emergency', 'follow-up'])
      .withMessage('Invalid appointment type'),
    
    body('priority')
      .optional()
      .isIn(['low', 'regular', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    
    body('reasonForVisit')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Reason for visit cannot exceed 300 characters')
  ], 
  createAppointment
);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private (Admin, Receptionist, MedTech, Pathologist, Patient - own only)
router.get('/:id', getAppointment);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (Admin, Receptionist)
router.put('/:id', 
  authorize('admin', 'receptionist'),
  [
    body('patientName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Patient name must be between 2 and 100 characters'),
    
    body('contactNumber')
      .optional()
      .matches(/^(\+63|0)[0-9]{10}$/)
      .withMessage('Please provide a valid Philippine phone number'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('serviceId')
      .optional()
      .isMongoId()
      .withMessage('Please provide a valid service ID'),
    
    body('appointmentDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    
    body('appointmentTime')
      .optional()
      .matches(/^(0?[1-9]|1[012]):[0-5][0-9] [AP]M$/)
      .withMessage('Please provide time in format HH:MM AM/PM'),
    
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'])
      .withMessage('Invalid appointment status'),
    
    body('priority')
      .optional()
      .isIn(['low', 'regular', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ], 
  updateAppointment
);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private (Admin, Receptionist, Patient - own only)
router.put('/:id/cancel', 
  [
    body('reason')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Cancellation reason cannot exceed 300 characters')
  ],
  cancelAppointment
);

// @route   PUT /api/appointments/:id/checkin
// @desc    Check-in patient
// @access  Private (Admin, Receptionist, MedTech)
router.put('/:id/checkin', 
  authorize('admin', 'receptionist', 'medtech'), 
  checkInPatient
);

// @route   PUT /api/appointments/:id/checkout
// @desc    Check-out patient
// @access  Private (Admin, Receptionist, MedTech)
router.put('/:id/checkout', 
  authorize('admin', 'receptionist', 'medtech'),
  [
    body('status')
      .optional()
      .isIn(['completed', 'no-show'])
      .withMessage('Checkout status must be completed or no-show')
  ],
  checkOutPatient
);

// @route   PUT /api/appointments/:id/assign
// @desc    Assign medical staff to appointment
// @access  Private (Admin, Receptionist)
router.put('/:id/assign', 
  authorize('admin', 'receptionist'),
  [
    body('medTechId')
      .optional()
      .isMongoId()
      .withMessage('Please provide a valid MedTech ID'),
    
    body('pathologistId')
      .optional()
      .isMongoId()
      .withMessage('Please provide a valid Pathologist ID')
  ],
  assignMedicalStaff
);

module.exports = router;