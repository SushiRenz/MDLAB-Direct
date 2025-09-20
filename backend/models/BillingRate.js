const mongoose = require('mongoose');

const BillingRateSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true
  },
  serviceCode: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['hematology', 'clinical_pathology', 'chemistry', 'microbiology', 'radiology', 'cardiology', 'package', 'emergency'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: String,
  turnaroundTime: {
    type: String,
    required: true
  },
  sampleType: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isPackage: {
    type: Boolean,
    default: false
  },
  packageItems: [{
    serviceName: String,
    serviceCode: String,
    price: Number
  }],
  packageSavings: {
    type: Number,
    default: 0
  },
  emergencyRate: {
    type: Number,
    default: 0
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priceHistory: [{
    price: Number,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeDate: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Add to price history when price changes
BillingRateSchema.pre('save', function(next) {
  if (this.isModified('price') && !this.isNew) {
    this.priceHistory.push({
      price: this.price,
      changedBy: this.updatedBy,
      reason: 'Price update'
    });
  }
  next();
});

// Virtual for display price
BillingRateSchema.virtual('displayPrice').get(function() {
  return `₱${this.price.toLocaleString()}`;
});

// Virtual for package total before discount
BillingRateSchema.virtual('packageOriginalPrice').get(function() {
  if (!this.isPackage) return 0;
  return this.packageItems.reduce((total, item) => total + item.price, 0);
});

module.exports = mongoose.model('BillingRate', BillingRateSchema);