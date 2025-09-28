const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: false, // Temporarily disabled to debug
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show', 'walk-in'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['scheduled', 'walk-in', 'emergency', 'follow-up'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'regular', 'high', 'urgent'],
    default: 'regular'
  },
  notes: {
    type: String,
    default: ''
  },
  reasonForVisit: {
    type: String,
    default: ''
  },
  // Check-in/Check-out tracking
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedInByName: {
    type: String
  },
  checkedOutAt: {
    type: Date
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedOutByName: {
    type: String
  },
  // Medical staff assignment
  assignedMedTech: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedPathologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Billing information
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number
  },
  billGenerated: {
    type: Boolean,
    default: false
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  // Results
  resultsReady: {
    type: Boolean,
    default: false
  },
  resultsReleasedAt: {
    type: Date
  },
  resultsReleasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String
  },
  // Created by (receptionist/admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  // Last modified
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedByName: {
    type: String
  },
  // Cancellation details
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate appointment ID
appointmentSchema.pre('save', async function(next) {
  try {
    if (!this.appointmentId) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Find the last appointment for today
      const lastAppointment = await this.constructor.findOne({
        appointmentId: new RegExp(`^${this.type === 'walk-in' ? 'WI' : 'APT'}-${year}${month}${day}`)
      }).sort({ appointmentId: -1 });
      
      let sequence = 1;
      if (lastAppointment) {
        const lastSequence = parseInt(lastAppointment.appointmentId.slice(-3));
        sequence = lastSequence + 1;
      }
      
      const prefix = this.type === 'walk-in' ? 'WI' : 'APT';
      this.appointmentId = `${prefix}-${year}${month}${day}-${String(sequence).padStart(3, '0')}`;
      console.log('Generated appointmentId:', this.appointmentId);
    }
    next();
  } catch (error) {
    console.error('Error generating appointmentId:', error);
    next(error);
  }
});

// Virtual for formatted appointment date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for duration in waiting room
appointmentSchema.virtual('waitingDuration').get(function() {
  if (this.checkedInAt && this.status === 'checked-in') {
    const now = new Date();
    const waitTime = now - this.checkedInAt;
    const minutes = Math.floor(waitTime / (1000 * 60));
    return `${minutes} minutes`;
  }
  return null;
});

// Static method to get today's appointments
appointmentSchema.statics.getTodayAppointments = function(status = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    appointmentDate: {
      $gte: today,
      $lt: tomorrow
    }
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).populate('patient service').sort({ appointmentTime: 1 });
};

// Static method to get appointment statistics
appointmentSchema.statics.getAppointmentStats = async function(date = null) {
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const pipeline = [
    {
      $match: {
        appointmentDate: {
          $gte: targetDate,
          $lt: nextDay
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    walkIn: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    switch(stat._id) {
      case 'pending':
        result.pending = stat.count;
        break;
      case 'confirmed':
        result.confirmed = stat.count;
        break;
      case 'checked-in':
        result.checkedIn = stat.count;
        break;
      case 'in-progress':
        result.inProgress = stat.count;
        break;
      case 'completed':
        result.completed = stat.count;
        break;
      case 'cancelled':
        result.cancelled = stat.count;
        break;
      case 'no-show':
        result.noShow = stat.count;
        break;
      case 'walk-in':
        result.walkIn = stat.count;
        break;
    }
  });
  
  return result;
};

// Instance method to check if appointment can be modified
appointmentSchema.methods.canBeModified = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Instance method to check if patient can check in
appointmentSchema.methods.canCheckIn = function() {
  return this.status === 'confirmed';
};

// Instance method to check if patient can check out
appointmentSchema.methods.canCheckOut = function() {
  return ['checked-in', 'in-progress'].includes(this.status);
};

module.exports = mongoose.model('Appointment', appointmentSchema);