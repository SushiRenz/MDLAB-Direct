const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
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
  amountPaid: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'gcash', 'bank_transfer', 'online_payment', 'insurance'],
    required: true
  },
  status: {
    type: String,
    enum: ['verified', 'pending', 'disputed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verificationDate: Date,
  referenceNumber: String,
  receiptNumber: String,
  notes: String,
  disputeReason: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date
}, {
  timestamps: true
});

// Generate Payment ID automatically
PaymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({});
    this.paymentId = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Generate receipt number for verified payments
PaymentSchema.pre('save', async function(next) {
  if (this.status === 'verified' && !this.receiptNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments({ 
      status: 'verified',
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    });
    this.receiptNumber = `RCP-${year}${month}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for display amount
PaymentSchema.virtual('displayAmount').get(function() {
  return `₱${this.amountPaid.toLocaleString()}`;
});

module.exports = mongoose.model('Payment', PaymentSchema);