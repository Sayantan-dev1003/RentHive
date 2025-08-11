const mongoose = require('mongoose');

const pricelistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pricelist name is required'],
    trim: true,
    maxlength: [200, 'Pricelist name cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['default', 'seasonal', 'corporate', 'vip'],
    default: 'default',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rules: [{
    productCategory: {
      type: String,
      required: true,
      enum: ['Electronics', 'Furniture', 'Vehicles', 'Sports', 'Tools', 'Events', 'Other', 'All']
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative']
    },
    durationUnit: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'all'],
      default: 'all'
    },
    minQuantity: {
      type: Number,
      default: 1,
      min: 1
    },
    minDuration: {
      type: Number, // in hours
      default: 1,
      min: 1
    }
  }],
  validity: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          return value > this.validity.startDate;
        },
        message: 'End date must be after start date'
      }
    }
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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

// Virtual to check if pricelist is currently valid
pricelistSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now;
});

// Method to check if pricelist applies to a specific date
pricelistSchema.methods.isValidForDate = function(date) {
  const checkDate = new Date(date);
  return this.isActive && 
         this.validity.startDate <= checkDate && 
         this.validity.endDate >= checkDate;
};

// Method to get applicable rules for a product category
pricelistSchema.methods.getApplicableRules = function(productCategory, quantity = 1, durationHours = 1) {
  return this.rules.filter(rule => {
    const categoryMatch = rule.productCategory === 'All' || rule.productCategory === productCategory;
    const quantityMatch = quantity >= rule.minQuantity;
    const durationMatch = durationHours >= rule.minDuration;
    
    return categoryMatch && quantityMatch && durationMatch;
  });
};

// Static method to find active pricelists for a date
pricelistSchema.statics.findActiveForDate = function(date = new Date()) {
  return this.find({
    isActive: true,
    'validity.startDate': { $lte: date },
    'validity.endDate': { $gte: date }
  }).sort({ priority: -1, createdAt: -1 });
};

// Indexes for performance
pricelistSchema.index({ type: 1 });
pricelistSchema.index({ isActive: 1 });
pricelistSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });
pricelistSchema.index({ priority: -1 });

module.exports = mongoose.model('Pricelist', pricelistSchema);
