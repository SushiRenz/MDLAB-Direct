const Log = require('../models/Log');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get system logs with filtering and pagination
// @route   GET /api/logs
// @access  Private (Admin only)
const getLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    level,
    category,
    userEmail,
    status,
    startDate,
    endDate,
    search
  } = req.query;

  // Build filter object
  const filter = {};

  if (level) {
    filter.level = level;
  }

  if (category) {
    filter.category = category;
  }

  if (userEmail) {
    filter.userEmail = { $regex: userEmail, $options: 'i' };
  }

  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }
  }

  // Search in action or details
  if (search) {
    filter.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const logs = await Log.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalLogs = await Log.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalLogs,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Private (Admin only)
const getLogStats = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const todayStats = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          errorCount: { $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] } },
          warningCount: { $sum: { $cond: [{ $eq: ['$level', 'warning'] }, 1, 0] } },
          criticalCount: { $sum: { $cond: [{ $eq: ['$level', 'critical'] }, 1, 0] } },
          securityAlerts: { $sum: { $cond: [{ $eq: ['$category', 'security'] }, 1, 0] } }
        }
      }
    ]);

    // Get unique active users today
    const activeUsers = await Log.distinct('userEmail', {
      timestamp: { $gte: today, $lt: tomorrow },
      userEmail: { $ne: 'system' }
    });

    // Get log level distribution
    const levelStats = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category distribution
    const categoryStats = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate system uptime (in hours)
    const oldestLogToday = await Log.findOne(
      { timestamp: { $gte: today, $lt: tomorrow } },
      { timestamp: 1 }
    ).sort({ timestamp: 1 });

    let uptimeHours = 24; // Default full day
    if (oldestLogToday) {
      uptimeHours = (Date.now() - oldestLogToday.timestamp.getTime()) / (1000 * 60 * 60);
    }

    const stats = {
      today: {
        totalEvents: todayStats[0]?.totalEvents || 0,
        activeUsers: activeUsers.length,
        securityAlerts: todayStats[0]?.securityAlerts || 0,
        systemUptime: `${Math.round((uptimeHours / 24) * 100 * 10) / 10}%`,
        errors: todayStats[0]?.errorCount || 0,
        warnings: todayStats[0]?.warningCount || 0,
        critical: todayStats[0]?.criticalCount || 0
      },
      levelDistribution: levelStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryDistribution: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch log statistics',
      error: error.message
    });
  }
});

// @desc    Create a new log entry
// @route   POST /api/logs
// @access  Private (Admin only)
const createLog = asyncHandler(async (req, res) => {
  const {
    level = 'info',
    action,
    details,
    userEmail = 'system',
    ipAddress = req.ip || '127.0.0.1',
    status = 'success',
    category = 'system_event',
    metadata = {}
  } = req.body;

  try {
    const log = await Log.createLog({
      level,
      action,
      details,
      userEmail,
      ipAddress,
      status,
      category,
      metadata
    });

    if (!log) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create log entry'
      });
    }

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create log entry',
      error: error.message
    });
  }
});

// @desc    Delete old logs (cleanup)
// @route   DELETE /api/logs/cleanup
// @access  Private (Admin only)
const cleanupLogs = asyncHandler(async (req, res) => {
  const { daysOld = 90 } = req.body;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await Log.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    // Log the cleanup action
    await Log.logInfo(
      'Log Cleanup',
      `Deleted ${result.deletedCount} log entries older than ${daysOld} days`,
      req.user?.email || 'system',
      req.ip || '127.0.0.1',
      { deletedCount: result.deletedCount, daysOld }
    );

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old log entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs',
      error: error.message
    });
  }
});

// @desc    Export logs
// @route   GET /api/logs/export
// @access  Private (Admin only)
const exportLogs = asyncHandler(async (req, res) => {
  const {
    format = 'json',
    level,
    category,
    startDate,
    endDate,
    limit = 1000
  } = req.query;

  // Build filter object
  const filter = {};

  if (level) filter.level = level;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  try {
    const logs = await Log.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    if (format === 'csv') {
      const csv = convertToCSV(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=system-logs.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=system-logs.json');
      res.json({
        success: true,
        exportDate: new Date().toISOString(),
        totalRecords: logs.length,
        data: logs
      });
    }

    // Log the export action
    await Log.logUserAction(
      'Export Logs',
      `Exported ${logs.length} log entries in ${format.toUpperCase()} format`,
      req.user?.email || 'system',
      req.ip || '127.0.0.1',
      'success',
      { format, recordCount: logs.length, filter }
    );

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export logs',
      error: error.message
    });
  }
});

// Helper function to convert logs to CSV format
const convertToCSV = (logs) => {
  const headers = ['Timestamp', 'Level', 'User Email', 'Action', 'Details', 'IP Address', 'Status', 'Category'];
  const csvRows = [headers.join(',')];

  logs.forEach(log => {
    const row = [
      log.timestamp.toISOString(),
      log.level,
      log.userEmail || '',
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      log.ipAddress || '',
      log.status,
      log.category
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

module.exports = {
  getLogs,
  getLogStats,
  createLog,
  cleanupLogs,
  exportLogs
};