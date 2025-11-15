const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true
  },
  appointmentId: {
    type: String,
    required: true
  },
  appointmentReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
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
    enum: ['cash'],
    default: 'cash',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'verified', 'disputed', 'refunded'],
    default: 'paid'
  },
  receiptNumber: String,
  notes: String,
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
    
    // Find the last payment ID for this year to avoid duplicates
    const lastPayment = await this.constructor.findOne({
      paymentId: { $regex: `^PAY-${year}-` }
    }).sort({ paymentId: -1 });
    
    let nextNumber = 1;
    if (lastPayment && lastPayment.paymentId) {
      const lastNumber = parseInt(lastPayment.paymentId.split('-')[2]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    this.paymentId = `PAY-${year}-${String(nextNumber).padStart(4, '0')}`;
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