const mongoose = require('mongoose');

const mobileLabScheduleSchema = new mongoose.Schema({
  // Basic schedule information
  scheduleId: {
    type: String,
    unique: true,
    default: function() {
      return 'MLS' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }
  },
  
  // Day of the week (0 = Sunday, 1 = Monday, etc.)
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  
  // Day name for easy reference
  dayName: {
    type: String,
    required: false, // Auto-generated from dayOfWeek
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  
  // Location information
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    barangay: {
      type: String,
      required: true,
      trim: true
    },
    municipality: {
      type: String,
      required: true,
      trim: true,
      default: 'Nueva Vizcaya'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  
  // Time schedule
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    timeDisplay: {
      type: String,
      required: false // Auto-generated from startTime and endTime
    }
  },
  
  // Schedule status
  status: {
    type: String,
    enum: ['Active', 'Scheduled', 'Next Location', 'On Call', 'Cancelled', 'Completed'],
    default: 'Scheduled'
  },
  
  // Services available at this location
  availableServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  // Capacity and limitations
  capacity: {
    maxPatients: {
      type: Number,
      default: 50
    },
    currentBookings: {
      type: Number,
      default: 0
    }
  },
  
  // Special notes or instructions
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  },
  
  // Contact information for the location
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    }
  },
  
  // Team assignments
  assignedTeam: {
    medTech: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  
  // Equipment and resources
  equipment: [{
    name: String,
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Maintenance', 'Unavailable'],
      default: 'Available'
    }
  }],
  
  // Recurring schedule settings
  recurring: {
    isRecurring: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'],
      default: 'Weekly'
    },
    startDate: {
      type: Date,
      required: false,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null // null means no end date
    }
  },
  
  // Weather and external factors
  weatherDependent: {
    type: Boolean,
    default: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Historical data
  visitHistory: [{
    visitDate: Date,
    patientsServed: Number,
    servicesProvided: Number,
    notes: String,
    weatherCondition: String,
    issues: String
  }],
  
  // Admin fields
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
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Soft delete
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
mobileLabScheduleSchema.index({ dayOfWeek: 1, isActive: 1 });
mobileLabScheduleSchema.index({ 'location.municipality': 1 });
mobileLabScheduleSchema.index({ 'location.barangay': 1 });
mobileLabScheduleSchema.index({ status: 1 });
mobileLabScheduleSchema.index({ scheduleId: 1 });
mobileLabScheduleSchema.index({ createdBy: 1 });
mobileLabScheduleSchema.index({ isDeleted: 1 });
mobileLabScheduleSchema.index({ 'recurring.startDate': 1, 'recurring.endDate': 1 });

// Virtual for full location display
mobileLabScheduleSchema.virtual('locationDisplay').get(function() {
  return `${this.location.name}, ${this.location.barangay}, ${this.location.municipality}`;
});

// Virtual for current availability
mobileLabScheduleSchema.virtual('availabilityStatus').get(function() {
  const available = this.capacity.maxPatients - this.capacity.currentBookings;
  return {
    available: available,
    percentage: (available / this.capacity.maxPatients * 100).toFixed(1)
  };
});

// Virtual for team display
mobileLabScheduleSchema.virtual('teamDisplay').get(function() {
  const team = [];
  if (this.assignedTeam.medTech) team.push('MedTech');
  if (this.assignedTeam.driver) team.push('Driver');
  if (this.assignedTeam.coordinator) team.push('Coordinator');
  return team.join(', ') || 'No team assigned';
});

// Method to check if schedule is currently active
mobileLabScheduleSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  
  return this.dayOfWeek === currentDay && 
         this.status === 'Active' && 
         this.isActive && 
         !this.isDeleted;
};

// Method to get next scheduled date
mobileLabScheduleSchema.methods.getNextScheduledDate = function() {
  const now = new Date();
  const currentDay = now.getDay();
  const targetDay = this.dayOfWeek;
  
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7; // Next week
  }
  
  const nextDate = new Date();
  nextDate.setDate(now.getDate() + daysUntil);
  return nextDate;
};

// Method to update booking count
mobileLabScheduleSchema.methods.updateBookingCount = function(increment = 1) {
  this.capacity.currentBookings = Math.max(0, this.capacity.currentBookings + increment);
  return this.save();
};

// Pre-save middleware
mobileLabScheduleSchema.pre('save', function(next) {
  // Ensure dayName matches dayOfWeek
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (this.dayOfWeek >= 0 && this.dayOfWeek <= 6) {
    this.dayName = dayNames[this.dayOfWeek];
  }
  
  // Set default time display if not provided
  if (!this.timeSlot.timeDisplay && this.timeSlot.startTime && this.timeSlot.endTime) {
    this.timeSlot.timeDisplay = `${this.timeSlot.startTime} - ${this.timeSlot.endTime}`;
  }
  
  next();
});

// Static method to get current week's schedule
mobileLabScheduleSchema.statics.getCurrentWeekSchedule = function() {
  return this.find({
    isActive: true,
    isDeleted: false
  })
  .populate('availableServices', 'serviceName price')
  .populate('assignedTeam.medTech', 'firstName lastName')
  .populate('assignedTeam.driver', 'firstName lastName')
  .populate('assignedTeam.coordinator', 'firstName lastName')
  .sort({ dayOfWeek: 1 });
};

// Static method to get active location
mobileLabScheduleSchema.statics.getCurrentActiveLocation = function() {
  const now = new Date();
  const currentDay = now.getDay();
  
  return this.findOne({
    dayOfWeek: currentDay,
    status: 'Active',
    isActive: true,
    isDeleted: false
  })
  .populate('availableServices', 'serviceName price')
  .populate('assignedTeam.medTech', 'firstName lastName')
  .populate('assignedTeam.driver', 'firstName lastName')
  .populate('assignedTeam.coordinator', 'firstName lastName');
};

// Static method to get next location
mobileLabScheduleSchema.statics.getNextLocation = function() {
  const now = new Date();
  const currentDay = now.getDay();
  
  return this.findOne({
    dayOfWeek: { $gt: currentDay },
    isActive: true,
    isDeleted: false
  })
  .sort({ dayOfWeek: 1 })
  .populate('availableServices', 'serviceName price')
  .populate('assignedTeam.medTech', 'firstName lastName')
  .populate('assignedTeam.driver', 'firstName lastName')
  .populate('assignedTeam.coordinator', 'firstName lastName');
};

const MobileLabSchedule = mongoose.model('MobileLabSchedule', mobileLabScheduleSchema);

module.exports = MobileLabSchedule;