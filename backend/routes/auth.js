const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../middleware/validation');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for auth routes - DISABLED IN DEVELOPMENT
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // High limit for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Skip in development
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // High limit for development
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Skip in development
});

// Public routes - NO RATE LIMITING IN DEVELOPMENT
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

// Development only: Reset all login attempts and locks
router.post('/dev-reset-attempts', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  
  try {
    await User.updateMany(
      {},
      {
        $unset: { 
          loginAttempts: 1, 
          lockUntil: 1 
        }
      }
    );
    
    res.json({
      success: true,
      message: 'All login attempts and locks have been reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting login attempts'
    });
  }
});

module.exports = router;
