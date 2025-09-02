const express = require('express');
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
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateCreateUser,
  validateUpdateUser
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Routes
router.route('/')
  .get(getUsers)
  .post(validateCreateUser, createUser);

router.route('/stats')
  .get(getUserStats);

router.route('/:id')
  .get(getUser)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

router.route('/:id/deactivate')
  .put(deactivateUser);

router.route('/:id/activate')
  .put(activateUser);

module.exports = router;
