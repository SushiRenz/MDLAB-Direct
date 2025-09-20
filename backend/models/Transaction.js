const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'PHP'
  },
  description: {
    type: String,
    required: true
  },
  patientId: {
    type: String
  },
  patientName: {
    type: String,
    required: true
  },
  billId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check', 'online', 'internal'],
    required: function() {
      return this.type !== 'adjustment';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  processedBy: {
    type: String,
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  referenceNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for display amount (formatted)
TransactionSchema.virtual('displayAmount').get(function() {
  return `₱${this.amount.toLocaleString()}`;
});

// Index for better query performance
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ patientName: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ processedAt: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);