const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  method: {
    type: String,
    enum: ['mock', 'razorpay', 'stripe', 'paypal', 'cash', 'bank_transfer'],
    default: 'mock',
    required: true
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    required: true
  },
  paymentGatewayResponse: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  refundDetails: {
    refundId: String,
    refundAmount: {
      type: Number,
      min: 0
    },
    refundDate: Date,
    refundReason: String
  },
  paidAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function() {
  if (!this.paidAt) return null;
  
  const now = new Date();
  const ageInDays = Math.floor((now - this.paidAt) / (1000 * 60 * 60 * 24));
  return ageInDays;
});

// Virtual for checking if payment is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual for checking if payment is refundable
paymentSchema.virtual('isRefundable').get(function() {
  return this.status === 'completed' && !this.refundDetails.refundId;
});

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(gatewayResponse = {}) {
  this.status = 'completed';
  this.paidAt = new Date();
  this.paymentGatewayResponse = gatewayResponse;
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function(reason, gatewayResponse = {}) {
  this.status = 'failed';
  this.failureReason = reason;
  this.paymentGatewayResponse = gatewayResponse;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  if (!this.isRefundable) {
    throw new Error('Payment is not refundable');
  }
  
  if (refundAmount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refundDetails = {
    refundId: `refund_${Date.now()}`,
    refundAmount: refundAmount || this.amount,
    refundDate: new Date(),
    refundReason: reason
  };
  
  this.status = 'refunded';
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStats = function(startDate, endDate) {
  const matchStage = {
    status: 'completed',
    paidAt: { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        paymentMethods: { $addToSet: '$method' }
      }
    }
  ]);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Set paidAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

// Indexes for performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ paidAt: -1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
