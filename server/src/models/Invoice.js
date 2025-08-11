const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Invoice amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'unpaid', 'partial', 'paid', 'cancelled', 'refunded'],
    default: 'unpaid',
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  pdfPath: {
    type: String,
    trim: true
  },
  pdfUrl: {
    type: String,
    trim: true
  },
  issuedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  paidAt: {
    type: Date
  },
  lineItems: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    rentalPeriod: {
      startDate: Date,
      endDate: Date
    }
  }],
  paymentTerms: {
    type: String,
    default: 'Due on receipt',
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    }
  },
  companyDetails: {
    name: { type: String, default: 'RentHive' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    taxId: String,
    email: String,
    phone: String
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

// Virtual for remaining amount
invoiceSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.totalAmount - this.paidAmount);
});

// Virtual for checking if invoice is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && new Date() > this.dueDate;
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  
  const now = new Date();
  const overdueDays = Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24));
  return overdueDays;
});

// Virtual for payment progress percentage
invoiceSchema.virtual('paymentProgress').get(function() {
  if (this.totalAmount === 0) return 100;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Update total amount
  this.totalAmount = this.amount + this.taxAmount - this.discountAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  }
  
  next();
});

// Method to record payment
invoiceSchema.methods.recordPayment = function(amount) {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }
  
  if (this.paidAmount + amount > this.totalAmount) {
    throw new Error('Payment amount exceeds remaining balance');
  }
  
  this.paidAmount += amount;
  
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    this.paidAt = new Date();
  } else {
    this.status = 'partial';
  }
  
  return this.save();
};

// Method to mark as cancelled
invoiceSchema.methods.cancel = function(reason) {
  if (this.status === 'paid') {
    throw new Error('Cannot cancel a paid invoice');
  }
  
  this.status = 'cancelled';
  this.notes = (this.notes || '') + `\nCancelled: ${reason}`;
  return this.save();
};

// Static method to generate next invoice number
invoiceSchema.statics.generateNextInvoiceNumber = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

// Static method to get invoice statistics
invoiceSchema.statics.getStats = function(startDate, endDate) {
  const matchStage = {
    issuedAt: { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' }
      }
    }
  ]);
};

// Indexes for performance
invoiceSchema.index({ orderId: 1 }, { unique: true });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ issuedAt: -1 });
invoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
