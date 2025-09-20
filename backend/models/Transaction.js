const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
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
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'online_payment', 'gcash', 'bank_transfer', 'insurance'],
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'processing', 'failed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  referenceNumber: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundDate: Date
}, {
  timestamps: true
});

// Generate Transaction ID automatically
TransactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({});
    this.transactionId = `TXN-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for display amount (formatted)
TransactionSchema.virtual('displayAmount').get(function() {
  return `₱${this.amount.toLocaleString()}`;
});

module.exports = mongoose.model('Transaction', TransactionSchema);