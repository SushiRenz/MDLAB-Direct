const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats
} = require('../controllers/userController');
const { body } = require('express-validator');

// Create router instance
const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/profile-pics');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${req.user.id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF allowed.'));
    }
  }
});

// Validation middleware for user creation
const validateUser = [
  body('username').isLength({ min: 3 }).trim().withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('role').isIn(['patient', 'medtech', 'pathologist', 'admin']).withMessage('Invalid role'),
];

const validateUserUpdate = [
  body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['patient', 'medtech', 'pathologist', 'admin']).withMessage('Invalid role'),
];

// Update profile route for current user - MUST come before /:id routes
router.put('/me', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['gender', 'dateOfBirth', 'address'];
    
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If new profile picture was uploaded
    if (req.file) {
      updates.profilePic = `/profile-pics/${req.file.filename}`;
      
      // Delete old profile picture if exists
      const oldUser = await User.findById(req.user.id);
      if (oldUser.profilePic) {
        const oldFilePath = path.join(__dirname, '../public', oldUser.profilePic);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Admin-only routes for user management
router.route('/stats')
  .get(protect, authorize('admin'), getUserStats);

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), validateUser, createUser);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), validateUserUpdate, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/activate')
  .put(protect, authorize('admin'), activateUser);

router.route('/:id/deactivate')
  .put(protect, authorize('admin'), deactivateUser);

module.exports = router;
