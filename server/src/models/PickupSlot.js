const mongoose = require('mongoose');

const pickupSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Max capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    default: 5
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for availability
pickupSlotSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.currentBookings < this.maxCapacity;
});

// Virtual for remaining capacity
pickupSlotSchema.virtual('remainingCapacity').get(function() {
  return Math.max(0, this.maxCapacity - this.currentBookings);
});

// Virtual for formatted date
pickupSlotSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time range
pickupSlotSchema.virtual('formattedTimeRange').get(function() {
  return `${this.timeSlot.startTime} - ${this.timeSlot.endTime}`;
});

// Method to check if slot can accommodate a booking
pickupSlotSchema.methods.canAccommodate = function(count = 1) {
  return this.isActive && (this.currentBookings + count) <= this.maxCapacity;
};

// Method to book slot
pickupSlotSchema.methods.bookSlot = function(count = 1) {
  if (!this.canAccommodate(count)) {
    throw new Error('Slot cannot accommodate this booking');
  }
  this.currentBookings += count;
  return this.save();
};

// Method to release slot booking
pickupSlotSchema.methods.releaseSlot = function(count = 1) {
  this.currentBookings = Math.max(0, this.currentBookings - count);
  return this.save();
};

// Static method to find available slots for a date range
pickupSlotSchema.statics.findAvailableSlots = function(startDate, endDate, minCapacity = 1) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isActive: true,
    $expr: {
      $gte: [
        { $subtract: ['$maxCapacity', '$currentBookings'] },
        minCapacity
      ]
    }
  }).sort({ date: 1, 'timeSlot.startTime': 1 });
};

// Static method to get slots for a specific date
pickupSlotSchema.statics.getSlotsForDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ 'timeSlot.startTime': 1 });
};

// Index for performance
pickupSlotSchema.index({ date: 1, 'timeSlot.startTime': 1 });
pickupSlotSchema.index({ date: 1, isActive: 1 });
pickupSlotSchema.index({ 'location.name': 1 });

// Pre-save middleware to validate time slot
pickupSlotSchema.pre('save', function(next) {
  const startTime = this.timeSlot.startTime;
  const endTime = this.timeSlot.endTime;
  
  if (startTime >= endTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Ensure date is not in the past (except for updates)
  if (this.isNew && this.date < new Date()) {
    return next(new Error('Cannot create pickup slot for past dates'));
  }
  
  next();
});

module.exports = mongoose.model('PickupSlot', pickupSlotSchema);
