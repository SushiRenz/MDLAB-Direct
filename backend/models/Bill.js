const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  services: [{
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled', 'partial'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'insurance', 'gcash', 'bank_transfer'],
    default: undefined // Allow null/undefined for unpaid bills
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
  }
}, {
  timestamps: true
});

// Generate Bill ID automatically
BillSchema.pre('save', async function(next) {
  if (!this.billId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({});
    this.billId = `BL-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for overdue status
BillSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate < new Date();
});

// Update status based on due date
BillSchema.pre('find', function() {
  this.updateMany(
    { 
      status: 'pending', 
      dueDate: { $lt: new Date() } 
    },
    { status: 'overdue' }
  );
});

module.exports = mongoose.model('Bill', BillSchema);