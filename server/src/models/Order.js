const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    rentalDuration: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true,
        validate: {
          validator: function(value) {
            return value > this.rentalDuration.startDate;
          },
          message: 'End date must be after start date'
        }
      }
    },
    priceApplied: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      },
      pricelistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricelist'
      },
      breakdown: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  }],
  status: {
    type: String,
    enum: ['quotation', 'reserved', 'picked_up', 'returned', 'late', 'cancelled'],
    default: 'quotation',
    required: true
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancel reason cannot exceed 500 characters']
  },
  extendedUntil: {
    type: Date
  },
  extensionHistory: [{
    originalEndDate: Date,
    newEndDate: Date,
    additionalCost: Number,
    extendedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  pickupSlot: {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupSlot'
    },
    confirmedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'missed'],
      default: 'pending'
    }
  },
  pickupDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending',
    required: true
  },
  depositAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  billingDetails: {
    fullName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total rental days
orderSchema.virtual('totalRentalDays').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  
  // Calculate average rental days across all items
  const totalDays = this.items.reduce((sum, item) => {
    const days = Math.ceil(
      (new Date(item.rentalDuration.endDate) - new Date(item.rentalDuration.startDate)) / 
      (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);
  
  return Math.ceil(totalDays / this.items.length);
});

// Virtual for checking if order is overdue
orderSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'picked_up') return false;
  
  const now = new Date();
  return this.items.some(item => new Date(item.rentalDuration.endDate) < now);
});

// Virtual for days overdue
orderSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  
  const now = new Date();
  const overdueDays = this.items.map(item => {
    const endDate = new Date(item.rentalDuration.endDate);
    if (endDate < now) {
      return Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
    }
    return 0;
  });
  
  return Math.max(...overdueDays);
});

// Method to calculate late fee
orderSchema.methods.calculateLateFee = function() {
  if (!this.isOverdue) return 0;
  
  const lateFeePerDay = process.env.LATE_FEE_PER_DAY || 100;
  return this.daysOverdue * lateFeePerDay;
};

// Method to check if order can be picked up
orderSchema.methods.canPickup = function() {
  return this.status === 'reserved' && this.paymentStatus !== 'pending';
};

// Method to check if order can be returned
orderSchema.methods.canReturn = function() {
  return this.status === 'picked_up';
};

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      return sum + item.priceApplied.totalPrice;
    }, 0) + this.lateFee;
  }
  next();
});

// Indexes for performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.rentalDuration.startDate': 1, 'items.rentalDuration.endDate': 1 });

module.exports = mongoose.model('Order', orderSchema);
