const express = require('express');
const router = express.Router();
const {
  getLogs,
  getLogStats,
  createLog,
  cleanupLogs,
  exportLogs
} = require('../controllers/logsController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes and restrict to admin only
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/logs
// @desc    Get system logs with filtering
// @access  Private (Admin only)
router.get('/', getLogs);

// @route   GET /api/logs/stats
// @desc    Get log statistics
// @access  Private (Admin only)
router.get('/stats', getLogStats);

// @route   GET /api/logs/export
// @desc    Export logs in JSON or CSV format
// @access  Private (Admin only)
router.get('/export', exportLogs);

// @route   POST /api/logs
// @desc    Create a new log entry
// @access  Private (Admin only)
router.post('/', createLog);

// @route   DELETE /api/logs/cleanup
// @desc    Delete old logs (cleanup)
// @access  Private (Admin only)
router.delete('/cleanup', cleanupLogs);

module.exports = router;