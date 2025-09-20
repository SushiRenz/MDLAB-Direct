const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getFinanceStats,
  getBills,
  createBill,
  getTransactions,
  createTransaction,
  getPayments,
  verifyPayment,
  getBillingRates,
  createBillingRate,
  updateBillingRate
} = require('../controllers/financeController');

const router = express.Router();

// All routes require authentication and admin/staff access
router.use(protect);
router.use(authorize('admin', 'medtech', 'pathologist')); // Allow staff to view finance data

// Finance dashboard stats
router.get('/stats', getFinanceStats);

// Bills routes
router.route('/bills')
  .get(getBills)
  .post(
    authorize('admin'), // Only admin can create bills
    [
      body('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Valid patient ID is required'),
      body('services')
        .isArray({ min: 1 })
        .withMessage('At least one service is required'),
      body('services.*.name')
        .notEmpty()
        .withMessage('Service name is required'),
      body('services.*.price')
        .isNumeric()
        .withMessage('Service price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Service price must be positive'),
      body('services.*.quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Service quantity must be at least 1'),
      body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Valid due date is required'),
      body('discount')
        .optional()
        .isNumeric()
        .withMessage('Discount must be a number')
        .isFloat({ min: 0 })
        .withMessage('Discount must be positive'),
      body('tax')
        .optional()
        .isNumeric()
        .withMessage('Tax must be a number')
        .isFloat({ min: 0 })
        .withMessage('Tax must be positive')
    ],
    createBill
  );

// Transactions routes
router.route('/transactions')
  .get(getTransactions)
  .post(
    authorize('admin'), // Only admin can create transactions
    [
      body('billId')
        .notEmpty()
        .withMessage('Bill ID is required')
        .isMongoId()
        .withMessage('Valid bill ID is required'),
      body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['cash', 'credit_card', 'debit_card', 'online_payment', 'gcash', 'bank_transfer', 'insurance'])
        .withMessage('Invalid payment method'),
      body('referenceNumber')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Reference number cannot be empty if provided')
    ],
    createTransaction
  );

// Payments routes
router.route('/payments')
  .get(getPayments);

router.put('/payments/:id/verify', 
  authorize('admin'), // Only admin can verify payments
  verifyPayment
);

// Billing rates routes
router.route('/billing-rates')
  .get(getBillingRates)
  .post(
    authorize('admin'), // Only admin can create billing rates
    [
      body('serviceName')
        .trim()
        .notEmpty()
        .withMessage('Service name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Service name must be between 2 and 100 characters'),
      body('serviceCode')
        .trim()
        .notEmpty()
        .withMessage('Service code is required')
        .isLength({ min: 2, max: 20 })
        .withMessage('Service code must be between 2 and 20 characters'),
      body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['hematology', 'clinical_pathology', 'chemistry', 'microbiology', 'radiology', 'cardiology', 'package', 'emergency'])
        .withMessage('Invalid category'),
      body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price must be positive'),
      body('turnaroundTime')
        .trim()
        .notEmpty()
        .withMessage('Turnaround time is required'),
      body('sampleType')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Sample type cannot be empty if provided'),
      body('isPackage')
        .optional()
        .isBoolean()
        .withMessage('isPackage must be a boolean'),
      body('packageItems')
        .optional()
        .isArray()
        .withMessage('Package items must be an array'),
      body('packageSavings')
        .optional()
        .isNumeric()
        .withMessage('Package savings must be a number')
        .isFloat({ min: 0 })
        .withMessage('Package savings must be positive'),
      body('emergencyRate')
        .optional()
        .isNumeric()
        .withMessage('Emergency rate must be a number')
        .isFloat({ min: 0 })
        .withMessage('Emergency rate must be positive')
    ],
    createBillingRate
  );

router.put('/billing-rates/:id',
  authorize('admin'), // Only admin can update billing rates
  [
    body('serviceName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Service name must be between 2 and 100 characters'),
    body('serviceCode')
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('Service code must be between 2 and 20 characters'),
    body('category')
      .optional()
      .isIn(['hematology', 'clinical_pathology', 'chemistry', 'microbiology', 'radiology', 'cardiology', 'package', 'emergency'])
      .withMessage('Invalid category'),
    body('price')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number')
      .isFloat({ min: 0 })
      .withMessage('Price must be positive'),
    body('turnaroundTime')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Turnaround time cannot be empty'),
    body('isPackage')
      .optional()
      .isBoolean()
      .withMessage('isPackage must be a boolean'),
    body('packageSavings')
      .optional()
      .isNumeric()
      .withMessage('Package savings must be a number')
      .isFloat({ min: 0 })
      .withMessage('Package savings must be positive'),
    body('emergencyRate')
      .optional()
      .isNumeric()
      .withMessage('Emergency rate must be a number')
      .isFloat({ min: 0 })
      .withMessage('Emergency rate must be positive')
  ],
  updateBillingRate
);

module.exports = router;