const { body } = require('express-validator');

// Register validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // More flexible phone validation - accept various formats
      const cleaned = value.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
      
      // Accept Philippine formats: +639xxxxxxxxx, 09xxxxxxxxx, 9xxxxxxxxx, or international format
      if (/^(\+?63|0)?9\d{9}$/.test(cleaned)) {
        return true;
      }
      
      // Accept other international formats (10-15 digits)
      if (/^\+?\d{10,15}$/.test(cleaned)) {
        return true;
      }
      
      throw new Error('Please provide a valid phone number');
    }),

  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Accept both ISO8601 strings and Date objects
      const birthDate = new Date(value);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        throw new Error('Please provide a valid date of birth');
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        throw new Error('You must be at least 13 years old to register');
      }
      
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .custom((value) => {
      // Address is required
      if (!value) {
        throw new Error('Address is required');
      }
      
      // Allow string format (new format)
      if (typeof value === 'string') {
        if (value.trim().length === 0) {
          throw new Error('Address cannot be empty');
        }
        if (value.length > 500) {
          throw new Error('Address cannot exceed 500 characters');
        }
        return true;
      }
      
      // Allow object format (old format) for backward compatibility
      if (typeof value === 'object' && value !== null) {
        if (!value.street && !value.city && !value.province && !value.zipCode) {
          throw new Error('Address object must have at least one field');
        }
        if (value.street && value.street.length > 200) {
          throw new Error('Street address cannot exceed 200 characters');
        }
        if (value.city && value.city.length > 100) {
          throw new Error('City cannot exceed 100 characters');
        }
        if (value.province && value.province.length > 100) {
          throw new Error('Province cannot exceed 100 characters');
        }
        if (value.zipCode && value.zipCode.length > 10) {
          throw new Error('ZIP code cannot exceed 10 characters');
        }
        return true;
      }
      
      throw new Error('Address must be either a string or an object with address fields');
    }),

  body('role')
    .optional()
    .isIn(['patient', 'medtech', 'pathologist', 'admin'])
    .withMessage('Role must be patient, medtech, pathologist, or admin')
];

// Login validation
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Update profile validation
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // More flexible phone validation - accept various formats
      const cleaned = value.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
      
      // Accept Philippine formats: +639xxxxxxxxx, 09xxxxxxxxx, 9xxxxxxxxx, or international format
      if (/^(\+?63|0)?9\d{9}$/.test(cleaned)) {
        return true;
      }
      
      // Accept other international formats (10-15 digits)
      if (/^\+?\d{10,15}$/.test(cleaned)) {
        return true;
      }
      
      throw new Error('Please provide a valid phone number');
    }),

  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Accept both ISO8601 strings and Date objects
      const birthDate = new Date(value);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        throw new Error('Please provide a valid date of birth');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('address')
    .optional()
    .custom((value) => {
      // Allow null/undefined
      if (!value) return true;
      
      // Allow string format (new format)
      if (typeof value === 'string') {
        if (value.length > 500) {
          throw new Error('Address cannot exceed 500 characters');
        }
        return true;
      }
      
      // Allow object format (old format) for backward compatibility
      if (typeof value === 'object' && value !== null) {
        if (value.street && value.street.length > 100) {
          throw new Error('Street address cannot exceed 100 characters');
        }
        if (value.city && value.city.length > 50) {
          throw new Error('City cannot exceed 50 characters');
        }
        if (value.province && value.province.length > 50) {
          throw new Error('Province cannot exceed 50 characters');
        }
        if (value.zipCode && value.zipCode.length > 10) {
          throw new Error('ZIP code cannot exceed 10 characters');
        }
        return true;
      }
      
      throw new Error('Address must be either a string or an object with address fields');
    })
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Create user validation (for admin)
const validateCreateUser = [
  ...validateRegister,
  body('role')
    .isIn(['patient', 'medtech', 'pathologist', 'admin'])
    .withMessage('Role must be patient, medtech, pathologist, or admin')
];

// Update user validation (for admin)
const validateUpdateUser = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // More flexible phone validation - accept various formats
      const cleaned = value.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
      
      // Accept Philippine formats: +639xxxxxxxxx, 09xxxxxxxxx, 9xxxxxxxxx, or international format
      if (/^(\+?63|0)?9\d{9}$/.test(cleaned)) {
        return true;
      }
      
      // Accept other international formats (10-15 digits)
      if (/^\+?\d{10,15}$/.test(cleaned)) {
        return true;
      }
      
      throw new Error('Please provide a valid phone number');
    }),

  body('role')
    .optional()
    .isIn(['patient', 'medtech', 'pathologist', 'admin'])
    .withMessage('Role must be patient, medtech, pathologist, or admin'),

  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Accept both ISO8601 strings and Date objects
      const birthDate = new Date(value);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        throw new Error('Please provide a valid date of birth');
      }
      
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('address')
    .optional()
    .custom((value) => {
      // Allow null/undefined
      if (!value) return true;
      
      // Allow string format (new format)
      if (typeof value === 'string') {
        if (value.length > 500) {
          throw new Error('Address cannot exceed 500 characters');
        }
        return true;
      }
      
      // Allow object format (old format) for backward compatibility
      if (typeof value === 'object' && value !== null) {
        if (value.street && value.street.length > 100) {
          throw new Error('Street address cannot exceed 100 characters');
        }
        if (value.city && value.city.length > 50) {
          throw new Error('City cannot exceed 50 characters');
        }
        if (value.province && value.province.length > 50) {
          throw new Error('Province cannot exceed 50 characters');
        }
        if (value.zipCode && value.zipCode.length > 10) {
          throw new Error('ZIP code cannot exceed 10 characters');
        }
        return true;
      }
      
      throw new Error('Address must be either a string or an object with address fields');
    })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateUser,
  validateUpdateUser
};
