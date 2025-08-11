const Notification = require('../models/Notification');
const Order = require('../models/Order');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');

/**
 * Get notifications for the authenticated user
 * GET /api/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    status,
    isRead
  } = req.query;

  // Build query
  const query = { recipientId: req.user._id };

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  // Execute query with pagination
  const notifications = await Notification.find(query)
    .populate('orderId', 'status totalAmount items')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      unreadCount
    }
  });
});

/**
 * Get single notification by ID
 * GET /api/notifications/:id
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id)
    .populate('recipientId', 'name email')
    .populate('orderId', 'status totalAmount items');

  if (!notification) {
    throw createNotFoundError('Notification');
  }

  // Check if user can access this notification
  if (notification.recipientId._id.toString() !== req.user._id.toString() && req.user.role !== 'end_user') {
    throw createNotFoundError('Notification');
  }

  res.status(200).json({
    success: true,
    data: {
      notification
    }
  });
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw createNotFoundError('Notification');
  }

  // Check if user can modify this notification
  if (notification.recipientId.toString() !== req.user._id.toString()) {
    throw createNotFoundError('Notification');
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification
    }
  });
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw createNotFoundError('Notification');
  }

  // Check if user can delete this notification
  if (notification.recipientId.toString() !== req.user._id.toString() && req.user.role !== 'end_user') {
    throw createNotFoundError('Notification');
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * Create a new notification (admin only)
 * POST /api/notifications
 */
const createNotification = asyncHandler(async (req, res) => {
  const {
    recipientId,
    type,
    orderId,
    title,
    message,
    scheduledFor,
    channels,
    priority
  } = req.body;

  // Validate required fields
  if (!recipientId || !type || !title || !message) {
    throw createValidationError('Recipient ID, type, title, and message are required');
  }

  // Validate order ID if provided
  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw createValidationError('Order not found');
    }
  }

  // Create notification
  const notification = new Notification({
    recipientId,
    type,
    orderId,
    title: title.trim(),
    message: message.trim(),
    scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
    channels: channels || ['in_app'],
    priority: priority || 'medium'
  });

  await notification.save();

  const populatedNotification = await Notification.findById(notification._id)
    .populate('recipientId', 'name email')
    .populate('orderId', 'status totalAmount');

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: {
      notification: populatedNotification
    }
  });
});

/**
 * Send test notification
 * POST /api/notifications/test
 */
const sendTestNotification = asyncHandler(async (req, res) => {
  const { type = 'system', title = 'Test Notification', message = 'This is a test notification from RentHive API' } = req.body;

  // Create test notification for the current user
  const notification = new Notification({
    recipientId: req.user._id,
    type,
    title,
    message,
    status: 'sent',
    sendDate: new Date()
  });

  await notification.save();

  // In a real implementation, you would send via email/SMS here
  console.log(`Test notification sent to user ${req.user._id}:`, {
    title,
    message,
    type
  });

  res.status(200).json({
    success: true,
    message: 'Test notification sent successfully',
    data: {
      notification
    }
  });
});

/**
 * Get notification templates
 * GET /api/notifications/templates
 */
const getNotificationTemplates = asyncHandler(async (req, res) => {
  const templates = {
    pickup_reminder: {
      title: 'Pickup Reminder',
      message: 'Your rental order is ready for pickup. Please collect your items by the scheduled date.',
      channels: ['email', 'in_app'],
      priority: 'medium'
    },
    return_reminder: {
      title: 'Return Reminder',
      message: 'Your rental period is ending soon. Please return the items by the due date to avoid late fees.',
      channels: ['email', 'in_app'],
      priority: 'medium'
    },
    payment_due: {
      title: 'Payment Due',
      message: 'Payment is due for your rental order. Please complete the payment to confirm your booking.',
      channels: ['email', 'sms', 'in_app'],
      priority: 'high'
    },
    late_return: {
      title: 'Late Return Notice',
      message: 'Your rental items are overdue. Please return them immediately to avoid additional charges.',
      channels: ['email', 'sms', 'in_app'],
      priority: 'urgent'
    },
    order_update: {
      title: 'Order Status Update',
      message: 'Your order status has been updated. Please check your order details.',
      channels: ['in_app'],
      priority: 'medium'
    },
    system: {
      title: 'System Notification',
      message: 'System maintenance or important updates.',
      channels: ['in_app'],
      priority: 'low'
    }
  };

  res.status(200).json({
    success: true,
    data: {
      templates
    }
  });
});

/**
 * Create notification from template
 * POST /api/notifications/from-template
 */
const createFromTemplate = asyncHandler(async (req, res) => {
  const {
    template,
    recipientId,
    orderId,
    customMessage,
    scheduledFor
  } = req.body;

  if (!template || !recipientId) {
    throw createValidationError('Template and recipient ID are required');
  }

  try {
    // Create notification from template
    const notification = Notification.createFromTemplate(
      template,
      recipientId,
      orderId,
      {
        message: customMessage,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      }
    );

    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipientId', 'name email')
      .populate('orderId', 'status totalAmount');

    res.status(201).json({
      success: true,
      message: 'Notification created from template successfully',
      data: {
        notification: populatedNotification
      }
    });
  } catch (error) {
    throw new Error(`Failed to create notification from template: ${error.message}`);
  }
});

/**
 * Get notification statistics
 * GET /api/notifications/stats
 */
const getNotificationStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, recipientId } = req.query;

  // Build match stage
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  if (recipientId) {
    matchStage.recipientId = recipientId;
  } else if (req.user.role === 'customer') {
    // Customers can only see their own stats
    matchStage.recipientId = req.user._id;
  }

  // Get statistics
  const stats = await Notification.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        read: { $sum: { $cond: ['$isRead', 1, 0] } },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }
    }
  ]);

  // Get breakdown by type
  const typeBreakdown = await Notification.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const result = stats[0] || {
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    read: 0,
    unread: 0
  };

  res.status(200).json({
    success: true,
    data: {
      overview: result,
      typeBreakdown,
      period: { startDate, endDate }
    }
  });
});

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendTestNotification,
  getNotificationTemplates,
  createFromTemplate,
  getNotificationStats
};
