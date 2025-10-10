const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `SRV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    }
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: {
      values: ['clinical_chemistry', 'hematology', 'clinical_microscopy', 'serology_immunology', 'blood_tests', 'urine_tests', 'imaging', 'pathology', 'special_tests', 'package_deals', 'emergency_tests'],
      message: 'Please select a valid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: null,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  duration: {
    type: String,
    required: [true, 'Service duration is required'],
    trim: true
  },
  sampleType: {
    type: String,
    required: [true, 'Sample type is required'],
    trim: true,
    maxlength: [100, 'Sample type cannot exceed 100 characters']
  },
  preparationInstructions: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Preparation instructions cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isPackage: {
    type: Boolean,
    default: false
  },
  packageItems: [{
    type: String,
    trim: true
  }],
  minAge: {
    type: Number,
    default: 0,
    min: [0, 'Minimum age cannot be negative']
  },
  maxAge: {
    type: Number,
    default: 120,
    max: [120, 'Maximum age cannot exceed 120']
  },
  gender: {
    type: String,
    enum: ['all', 'male', 'female'],
    default: 'all'
  },
  normalRange: {
    male: { type: String, default: '' },
    female: { type: String, default: '' },
    general: { type: String, default: '' }
  },
  methodology: {
    type: String,
    default: '',
    trim: true
  },
  equipment: {
    type: String,
    default: '',
    trim: true
  },
  orderCount: {
    type: Number,
    default: 0,
    min: [0, 'Order count cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  availability: {
    type: String,
    enum: ['24_7', 'weekdays_only', 'appointment_only', 'emergency_only'],
    default: '24_7'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serviceSchema.index({ serviceName: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isPopular: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for display price (shows discount price if available)
serviceSchema.virtual('displayPrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for savings amount
serviceSchema.virtual('savings').get(function() {
  return this.discountPrice ? this.price - this.discountPrice : 0;
});

// Virtual for savings percentage
serviceSchema.virtual('savingsPercentage').get(function() {
  return this.discountPrice ? Math.round(((this.price - this.discountPrice) / this.price) * 100) : 0;
});

// Static method to get service statistics
serviceSchema.statics.getServiceStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactiveServices: { $sum: { $cond: ['$isActive', 0, 1] } },
        popularServices: { $sum: { $cond: ['$isPopular', 1, 0] } },
        packageServices: { $sum: { $cond: ['$isPackage', 1, 0] } },
        averagePrice: { $avg: '$price' },
        totalOrderCount: { $sum: '$orderCount' }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    general: stats[0] || {
      totalServices: 0,
      activeServices: 0,
      inactiveServices: 0,
      popularServices: 0,
      packageServices: 0,
      averagePrice: 0,
      totalOrderCount: 0
    },
    byCategory: categoryStats
  };
};

// Static method to get popular services
serviceSchema.statics.getPopularServices = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ orderCount: -1, isPopular: -1 })
    .limit(limit)
    .select('serviceName category price displayPrice orderCount');
};

// Instance method to increment order count
serviceSchema.methods.incrementOrderCount = async function() {
  this.orderCount += 1;
  return this.save();
};

// Pre-save middleware to generate serviceId if not provided
serviceSchema.pre('save', function(next) {
  if (!this.serviceId) {
    this.serviceId = `SRV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }
  next();
});

// Pre-save middleware to validate package items
serviceSchema.pre('save', function(next) {
  if (this.isPackage && (!this.packageItems || this.packageItems.length === 0)) {
    return next(new Error('Package services must have at least one package item'));
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;