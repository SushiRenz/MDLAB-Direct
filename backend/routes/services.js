const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceStats,
  getPopularServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  toggleServicePopular,
  bulkUpdateServices,
  getServiceCategories
} = require('../controllers/servicesController');

const { protect, authorize } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/popular', getPopularServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);

// Protected routes (authentication required)
// Admin and staff can view services
router.get('/', protect, authorize('admin', 'staff'), getServices);

// Admin only routes
router.use(protect, authorize('admin')); // All routes below require admin access

// Service management routes
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

// Service status management
router.patch('/:id/toggle-status', toggleServiceStatus);
router.patch('/:id/toggle-popular', toggleServicePopular);

// Bulk operations
router.patch('/bulk-update', bulkUpdateServices);

// Statistics and analytics
router.get('/admin/stats', getServiceStats);

module.exports = router;