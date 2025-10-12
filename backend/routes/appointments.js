const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
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
      .matches(/^(\+63|63|0)?[0-9]{9,11}$/)
      .withMessage('Please provide a valid phone number'),
    
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('age')
      .optional()
      .custom((value) => {
        if (!value) return true; // Allow empty/null values since it's optional
        
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 120) {
          throw new Error('Age must be a number between 1 and 120');
        }
        return true;
      })
      .withMessage('Age must be between 1 and 120'),
    
    body('sex')
      .optional()
      .isIn(['Male', 'Female'])
      .withMessage('Sex must be either Male or Female'),
    
    body('serviceId')
      .optional()
      .isMongoId()
      .withMessage('Please provide a valid service ID'),
    
    body('serviceIds')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Service IDs must be a non-empty array')
      .custom((value, { req }) => {
        // At least one of serviceId or serviceIds must be provided
        if (!req.body.serviceId && (!value || value.length === 0)) {
          throw new Error('Either serviceId or serviceIds must be provided');
        }
        
        // If serviceIds is provided, validate each ID
        if (value && value.length > 0) {
          const mongoose = require('mongoose');
          for (let i = 0; i < value.length; i++) {
            const id = value[i];
            if (!mongoose.Types.ObjectId.isValid(id)) {
              throw new Error(`Service ID at position ${i + 1} is not a valid MongoDB ObjectId: ${id}`);
            }
          }
        }
        
        return true;
      }),
    
    body('appointmentDate')
      .notEmpty()
      .withMessage('Appointment date is required')
      .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Please provide a valid date');
        }
        return true;
      }),
    
    body('totalPrice')
      .optional()
      .custom((value) => {
        if (!value) return true; // Allow empty/null values since it's optional
        
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          throw new Error('Total price must be a positive number');
        }
        return true;
      }),
    
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
      .withMessage('Notes cannot exceed 500 characters'),
    
    body('billGenerated')
      .optional()
      .isBoolean()
      .withMessage('Bill generated must be a boolean value'),
    
    body('actualCost')
      .optional()
      .isNumeric()
      .withMessage('Actual cost must be a number')
      .isFloat({ min: 0 })
      .withMessage('Actual cost must be a positive number')
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

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment permanently
// @access  Private (Admin, Receptionist)
router.delete('/:id',
  authorize('admin', 'receptionist'),
  deleteAppointment
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