const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true,
    default: 'info'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: {
    type: String,
    default: 'system'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'warning', 'blocked', 'resolved'],
    required: true,
    default: 'success'
  },
  category: {
    type: String,
    enum: ['user_action', 'system_event', 'security', 'authentication', 'database', 'finance', 'api'],
    required: true,
    default: 'system_event'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });
logSchema.index({ category: 1 });
logSchema.index({ userEmail: 1 });

// Static method to create log entries
logSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create log entry:', error);
    return null;
  }
};

// Static methods for different log levels
logSchema.statics.logInfo = function(action, details, userEmail = 'system', ipAddress = '127.0.0.1', metadata = {}) {
  return this.createLog({
    level: 'info',
    action,
    details,
    userEmail,
    ipAddress,
    status: 'success',
    category: 'system_event',
    metadata
  });
};

logSchema.statics.logWarning = function(action, details, userEmail = 'system', ipAddress = '127.0.0.1', metadata = {}) {
  return this.createLog({
    level: 'warning',
    action,
    details,
    userEmail,
    ipAddress,
    status: 'warning',
    category: 'system_event',
    metadata
  });
};

logSchema.statics.logError = function(action, details, userEmail = 'system', ipAddress = '127.0.0.1', metadata = {}) {
  return this.createLog({
    level: 'error',
    action,
    details,
    userEmail,
    ipAddress,
    status: 'failed',
    category: 'system_event',
    metadata
  });
};

logSchema.statics.logUserAction = function(action, details, userEmail, ipAddress = '127.0.0.1', status = 'success', metadata = {}) {
  return this.createLog({
    level: 'info',
    action,
    details,
    userEmail,
    ipAddress,
    status,
    category: 'user_action',
    metadata
  });
};

logSchema.statics.logSecurity = function(action, details, userEmail = 'unknown', ipAddress = '127.0.0.1', status = 'blocked', metadata = {}) {
  return this.createLog({
    level: status === 'blocked' ? 'critical' : 'warning',
    action,
    details,
    userEmail,
    ipAddress,
    status,
    category: 'security',
    metadata
  });
};

logSchema.statics.logAuthentication = function(action, details, userEmail, ipAddress = '127.0.0.1', status = 'success', metadata = {}) {
  return this.createLog({
    level: status === 'success' ? 'info' : 'warning',
    action,
    details,
    userEmail,
    ipAddress,
    status,
    category: 'authentication',
    metadata
  });
};

const Log = mongoose.model('Log', logSchema);

module.exports = Log;