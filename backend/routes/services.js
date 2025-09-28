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
router.get('/', getServices); // Allow public access to view services
router.get('/stats', getServiceStats); // Public stats endpoint for dashboard
router.get('/popular', getPopularServices);
router.get('/categories', getServiceCategories);

// Admin-only statistics route (needs to be before /:id route)
router.get('/admin/stats', protect, authorize('admin'), getServiceStats);

// Public service by ID route
router.get('/:id', getServiceById);

// Protected routes - Admin only routes for service management
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

module.exports = router;