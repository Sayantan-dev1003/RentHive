const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient ID is required']
  },
  type: {
    type: String,
    enum: ['pickup_reminder', 'return_reminder', 'payment_due', 'late_return', 'system', 'order_update'],
    required: [true, 'Notification type is required']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  sendDate: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    required: true
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    default: 'in_app'
  }],
  emailDetails: {
    subject: String,
    htmlContent: String,
    attachments: [{
      filename: String,
      path: String,
      contentType: String
    }]
  },
  smsDetails: {
    phoneNumber: String,
    shortMessage: String
  },
  readAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastRetryAt: {
    type: Date
  },
  errorDetails: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if notification is overdue
notificationSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.scheduledFor;
});

// Virtual for time since created
notificationSchema.virtual('timeSinceCreated').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Less than an hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sendDate = new Date();
  return this.save();
};

// Method to mark as failed with retry logic
notificationSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  this.errorDetails = error.toString();
  
  // Auto-retry logic: retry up to 3 times
  if (this.retryCount < 3) {
    this.status = 'pending';
    // Schedule retry with exponential backoff
    this.scheduledFor = new Date(Date.now() + (this.retryCount * 30 * 60 * 1000)); // 30, 60, 90 minutes
  }
  
  return this.save();
};

// Static method to create notification templates
notificationSchema.statics.createFromTemplate = function(template, recipientId, orderId, additionalData = {}) {
  const templates = {
    pickup_reminder: {
      title: 'Pickup Reminder',
      message: `Your rental order is ready for pickup. Please collect your items by the scheduled date.`,
      type: 'pickup_reminder',
      priority: 'medium',
      channels: ['email', 'in_app']
    },
    return_reminder: {
      title: 'Return Reminder',
      message: `Your rental period is ending soon. Please return the items by the due date to avoid late fees.`,
      type: 'return_reminder',
      priority: 'medium',
      channels: ['email', 'in_app']
    },
    payment_due: {
      title: 'Payment Due',
      message: `Payment is due for your rental order. Please complete the payment to confirm your booking.`,
      type: 'payment_due',
      priority: 'high',
      channels: ['email', 'sms', 'in_app']
    },
    late_return: {
      title: 'Late Return Notice',
      message: `Your rental items are overdue. Please return them immediately to avoid additional charges.`,
      type: 'late_return',
      priority: 'urgent',
      channels: ['email', 'sms', 'in_app']
    }
  };
  
  const baseTemplate = templates[template];
  if (!baseTemplate) {
    throw new Error(`Template ${template} not found`);
  }
  
  return new this({
    ...baseTemplate,
    recipientId,
    orderId,
    ...additionalData
  });
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    recipientId: userId, 
    isRead: false 
  });
};

// Static method to get pending notifications for sending
notificationSchema.statics.getPendingNotifications = function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  }).populate('recipientId orderId');
};

// Indexes for performance
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ orderId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
