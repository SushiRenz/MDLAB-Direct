const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  // Basic identification
  sampleId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'S' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }
  },
  
  // Patient reference
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Associated appointment (if exists)
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  
  // Service/Test information
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  
  // Test results - flexible schema for different test types
  results: {
    type: Map,
    of: String,  // Store all values as strings for consistency
    required: true
  },
  
  // Reference ranges (optional)
  referenceRanges: {
    type: Map,
    of: {
      min: Number,
      max: Number,
      unit: String,
      normalRange: String
    },
    default: new Map()
  },
  
  // Test status
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'reviewed', 'released'],
    default: 'pending'
  },
  
  // Dates
  sampleDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedDate: {
    type: Date,
    default: null
  },
  releasedDate: {
    type: Date,
    default: null
  },
  
  // Medical staff assignments
  medTech: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pathologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Quality control
  qcPassed: {
    type: Boolean,
    default: false
  },
  qcNotes: {
    type: String,
    default: ''
  },
  
  // Notes and comments
  notes: {
    type: String,
    default: ''
  },
  medTechNotes: {
    type: String,
    default: ''
  },
  pathologistNotes: {
    type: String,
    default: ''
  },
  
  // Flags
  isAbnormal: {
    type: Boolean,
    default: false
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  
  // Patient notification
  patientNotified: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date,
    default: null
  },
  
  // File attachments (for images, PDFs, etc.)
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // System fields
  version: {
    type: Number,
    default: 1
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
testResultSchema.index({ patient: 1, sampleDate: -1 });
testResultSchema.index({ sampleId: 1 });
testResultSchema.index({ appointment: 1 });
testResultSchema.index({ service: 1 });
testResultSchema.index({ status: 1 });
testResultSchema.index({ medTech: 1 });
testResultSchema.index({ pathologist: 1 });
testResultSchema.index({ isDeleted: 1 });
testResultSchema.index({ createdAt: -1 });

// Virtual for patient name (populated)
testResultSchema.virtual('patientName').get(function() {
  if (this.patient && typeof this.patient === 'object') {
    return `${this.patient.firstName} ${this.patient.lastName}`;
  }
  return '';
});

// Virtual for service name (populated)
testResultSchema.virtual('serviceName').get(function() {
  if (this.service && typeof this.service === 'object') {
    return this.service.serviceName;
  }
  return this.testType || '';
});

// Virtual for formatted results
testResultSchema.virtual('formattedResults').get(function() {
  const results = {};
  for (const [key, value] of this.results.entries()) {
    const range = this.referenceRanges.get(key);
    results[key] = {
      value: value,
      range: range,
      isNormal: range ? this.isValueNormal(key, value) : null
    };
  }
  return results;
});

// Method to check if a value is within normal range
testResultSchema.methods.isValueNormal = function(key, value) {
  const range = this.referenceRanges.get(key);
  if (!range || !range.min || !range.max) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;
  
  return numValue >= range.min && numValue <= range.max;
};

// Method to calculate abnormal flags
testResultSchema.methods.updateAbnormalFlags = function() {
  let hasAbnormal = false;
  let hasCritical = false;
  
  for (const [key, value] of this.results.entries()) {
    const isNormal = this.isValueNormal(key, value);
    if (isNormal === false) {
      hasAbnormal = true;
      
      // Check for critical values (you can define these based on your lab standards)
      const numValue = parseFloat(value);
      const range = this.referenceRanges.get(key);
      
      if (range && !isNaN(numValue)) {
        // Consider critical if value is 50% outside normal range
        const midRange = (range.min + range.max) / 2;
        const rangeWidth = range.max - range.min;
        const criticalThreshold = rangeWidth * 0.5;
        
        if (numValue < range.min - criticalThreshold || numValue > range.max + criticalThreshold) {
          hasCritical = true;
        }
      }
    }
  }
  
  this.isAbnormal = hasAbnormal;
  this.isCritical = hasCritical;
};

// Pre-save middleware
testResultSchema.pre('save', function(next) {
  // Update abnormal flags
  this.updateAbnormalFlags();
  
  // Update completed date when status changes to completed
  if (this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  // Update released date when status changes to released
  if (this.status === 'released' && !this.releasedDate) {
    this.releasedDate = new Date();
  }
  
  // Increment version on updates
  if (!this.isNew) {
    this.increment('version');
  }
  
  next();
});

// Static method to get default reference ranges
testResultSchema.statics.getDefaultReferenceRanges = function(testType) {
  const ranges = {
    'Complete Blood Count (CBC)': {
      hemoglobin: { min: 12.0, max: 15.5, unit: 'g/dL' },
      hematocrit: { min: 36, max: 46, unit: '%' },
      wbc: { min: 4.5, max: 11.0, unit: '×10³/μL' },
      rbc: { min: 4.2, max: 5.4, unit: '×10⁶/μL' },
      platelets: { min: 150, max: 400, unit: '×10³/μL' }
    },
    'Blood Sugar Test': {
      glucose: { min: 70, max: 100, unit: 'mg/dL' },
      hba1c: { min: 4.0, max: 5.6, unit: '%' }
    },
    'Lipid Profile': {
      totalCholesterol: { min: 0, max: 200, unit: 'mg/dL' },
      ldl: { min: 0, max: 100, unit: 'mg/dL' },
      hdl: { min: 40, max: 999, unit: 'mg/dL' },
      triglycerides: { min: 0, max: 150, unit: 'mg/dL' }
    },
    'Urinalysis': {
      specificGravity: { min: 1.003, max: 1.030, unit: '' },
      ph: { min: 4.6, max: 8.0, unit: '' },
      protein: { min: 0, max: 30, unit: 'mg/dL' },
      glucose: { min: 0, max: 0, unit: 'mg/dL' }
    }
  };
  
  return ranges[testType] || {};
};

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;