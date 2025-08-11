const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Electronics', 'Furniture', 'Vehicles', 'Sports', 'Tools', 'Events', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  rentable: {
    type: Boolean,
    default: true,
    required: true
  },
  pricing: {
    hour: {
      type: Number,
      required: [true, 'Hourly price is required'],
      min: [0, 'Price cannot be negative']
    },
    day: {
      type: Number,
      required: [true, 'Daily price is required'],
      min: [0, 'Price cannot be negative']
    },
    week: {
      type: Number,
      required: [true, 'Weekly price is required'],
      min: [0, 'Price cannot be negative']
    },
    month: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 1
  },
  availability: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  images: {
    type: [String], // The data type should be an array of strings
    default: [],
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current available quantity
productSchema.virtual('currentAvailableStock').get(function() {
  const now = new Date();
  const reservedQuantity = this.availability
    .filter(reservation => 
      reservation.startDate <= now && 
      reservation.endDate >= now
    )
    .reduce((total, reservation) => total + reservation.quantity, 0);
  
  return Math.max(0, this.stock - reservedQuantity);
});

// Method to check availability for a date range
productSchema.methods.checkAvailability = function(startDate, endDate, quantity = 1) {
  const overlappingReservations = this.availability.filter(reservation => {
    // Check for overlap: two periods overlap if startA <= endB && startB <= endA
    return new Date(reservation.startDate) <= new Date(endDate) && 
           new Date(startDate) <= new Date(reservation.endDate);
  });
  
  const reservedQuantity = overlappingReservations.reduce(
    (total, reservation) => total + reservation.quantity, 
    0
  );
  
  const availableQuantity = this.stock - reservedQuantity;
  return availableQuantity >= quantity;
};

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ rentable: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });

module.exports = mongoose.model('Product', productSchema);
