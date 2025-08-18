const cron = require('node-cron');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const moment = require('moment');

/**
 * Initialize notification scheduler
 */
const initNotificationScheduler = () => {
  console.log('🕐 Starting notification scheduler...');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('⏰ Running hourly notification check...');
      
      await createPickupReminders();
      await createReturnReminders();
      await createLateReturnNotices();
      await createPaymentDueReminders();
      
      console.log('✅ Hourly notification check completed');
    } catch (error) {
      console.error('❌ Error in notification scheduler:', error);
    }
  });

  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('📅 Running daily notification summary...');
      
      await createDailyDigest();
      await cleanupOldNotifications();
      
      console.log('✅ Daily notification tasks completed');
    } catch (error) {
      console.error('❌ Error in daily notification tasks:', error);
    }
  });

  console.log('✅ Notification scheduler initialized');
};

/**
 * Create pickup reminders for orders ready for pickup
 */
const createPickupReminders = async () => {
  try {
    const notifyHours = parseInt(process.env.PICKUP_REMINDER_HOURS) || 24;
    const reminderTime = moment().add(notifyHours, 'hours');

    // Find orders that are reserved and have pickup dates approaching
    const orders = await Order.find({
      status: 'reserved',
      paymentStatus: { $in: ['paid', 'partial'] },
      'items.rentalDuration.startDate': {
        $gte: moment().toDate(),
        $lte: reminderTime.toDate()
      }
    }).populate('customerId', 'name email');

    let created = 0;

    for (const order of orders) {
      // Skip orders with invalid customer references
      if (!order.customerId || !order.customerId._id) {
        console.warn(`⚠️ Order ${order._id} has invalid customerId, skipping notification`);
        continue;
      }

      // Check if reminder already sent
      const existingNotification = await Notification.findOne({
        recipientId: order.customerId._id,
        orderId: order._id,
        type: 'pickup_reminder',
        status: { $in: ['sent', 'pending'] }
      });

      if (!existingNotification) {
        const notification = Notification.createFromTemplate(
          'pickup_reminder',
          order.customerId._id,
          order._id,
          {
            title: 'Pickup Reminder - Your Rental is Ready',
            message: `Hi ${order.customerId.name}, your rental order ${order._id} is ready for pickup. Please collect your items by ${moment(order.items[0].rentalDuration.startDate).format('DD/MM/YYYY HH:mm')}.`
          }
        );

        await notification.save();
        created++;
        
        console.log(`📦 Created pickup reminder for order ${order._id}`);
      }
    }

    if (created > 0) {
      console.log(`✅ Created ${created} pickup reminders`);
    }
  } catch (error) {
    console.error('❌ Error creating pickup reminders:', error);
  }
};

/**
 * Create return reminders for items due for return
 */
const createReturnReminders = async () => {
  try {
    const notifyDays = parseInt(process.env.RETURN_REMINDER_DAYS) || 2;
    const reminderTime = moment().add(notifyDays, 'days');

    // Find orders that are picked up and have return dates approaching
    const orders = await Order.find({
      status: 'picked_up',
      'items.rentalDuration.endDate': {
        $gte: moment().toDate(),
        $lte: reminderTime.toDate()
      }
    }).populate('customerId', 'name email');

    let created = 0;

    for (const order of orders) {
      // Check if reminder already sent in the last 24 hours
      const existingNotification = await Notification.findOne({
        recipientId: order.customerId._id,
        orderId: order._id,
        type: 'return_reminder',
        createdAt: { $gte: moment().subtract(24, 'hours').toDate() }
      });

      if (!existingNotification) {
        const earliestReturn = order.items.reduce((earliest, item) => {
          const itemReturn = moment(item.rentalDuration.endDate);
          return !earliest || itemReturn.isBefore(earliest) ? itemReturn : earliest;
        }, null);

        const notification = Notification.createFromTemplate(
          'return_reminder',
          order.customerId._id,
          order._id,
          {
            title: 'Return Reminder - Items Due Soon',
            message: `Hi ${order.customerId.name}, your rental items from order ${order._id} are due for return by ${earliestReturn.format('DD/MM/YYYY HH:mm')}. Please return them on time to avoid late fees.`
          }
        );

        await notification.save();
        created++;
        
        console.log(`🔄 Created return reminder for order ${order._id}`);
      }
    }

    if (created > 0) {
      console.log(`✅ Created ${created} return reminders`);
    }
  } catch (error) {
    console.error('❌ Error creating return reminders:', error);
  }
};

/**
 * Create late return notices for overdue items
 */
const createLateReturnNotices = async () => {
  try {
    // Find orders that are picked up and overdue
    const overdueOrders = await Order.find({
      status: 'picked_up',
      'items.rentalDuration.endDate': { $lt: moment().toDate() }
    }).populate('customerId', 'name email');

    let created = 0;

    for (const order of overdueOrders) {
      // Check if late notice already sent in the last 12 hours
      const existingNotification = await Notification.findOne({
        recipientId: order.customerId._id,
        orderId: order._id,
        type: 'late_return',
        createdAt: { $gte: moment().subtract(12, 'hours').toDate() }
      });

      if (!existingNotification) {
        const daysLate = moment().diff(moment(order.items[0].rentalDuration.endDate), 'days');
        const lateFee = daysLate * (parseFloat(process.env.LATE_FEE_PER_DAY) || 100);

        const notification = Notification.createFromTemplate(
          'late_return',
          order.customerId._id,
          order._id,
          {
            title: 'URGENT: Items Overdue - Immediate Return Required',
            message: `Hi ${order.customerId.name}, your rental items from order ${order._id} are ${daysLate} day(s) overdue. Please return them immediately. Current late fee: ₹${lateFee}. Additional charges apply for each day of delay.`,
            priority: 'urgent'
          }
        );

        await notification.save();
        created++;
        
        console.log(`⚠️ Created late return notice for order ${order._id} (${daysLate} days late)`);
      }
    }

    if (created > 0) {
      console.log(`✅ Created ${created} late return notices`);
    }
  } catch (error) {
    console.error('❌ Error creating late return notices:', error);
  }
};

/**
 * Create payment due reminders
 */
const createPaymentDueReminders = async () => {
  try {
    // Find orders with pending payments that are due soon
    const pendingOrders = await Order.find({
      paymentStatus: 'pending',
      status: { $in: ['reserved', 'quotation'] },
      createdAt: { $gte: moment().subtract(7, 'days').toDate() } // Only recent orders
    }).populate('customerId', 'name email')
      .populate('invoiceId');

    let created = 0;

    for (const order of pendingOrders) {
      if (!order.invoiceId) continue;

      const daysSinceOrder = moment().diff(moment(order.createdAt), 'days');
      
      // Send reminders at 1, 3, and 6 days after order creation
      const reminderDays = [1, 3, 6];
      if (!reminderDays.includes(daysSinceOrder)) continue;

      // Check if reminder already sent today
      const existingNotification = await Notification.findOne({
        recipientId: order.customerId._id,
        orderId: order._id,
        type: 'payment_due',
        createdAt: { $gte: moment().startOf('day').toDate() }
      });

      if (!existingNotification) {
        const notification = Notification.createFromTemplate(
          'payment_due',
          order.customerId._id,
          order._id,
          {
            title: 'Payment Reminder - Complete Your Booking',
            message: `Hi ${order.customerId.name}, payment of ₹${order.totalAmount} is pending for your order ${order._id}. Please complete the payment to confirm your rental booking.`,
            priority: daysSinceOrder >= 6 ? 'high' : 'medium'
          }
        );

        await notification.save();
        created++;
        
        console.log(`💳 Created payment reminder for order ${order._id} (${daysSinceOrder} days old)`);
      }
    }

    if (created > 0) {
      console.log(`✅ Created ${created} payment reminders`);
    }
  } catch (error) {
    console.error('❌ Error creating payment reminders:', error);
  }
};

/**
 * Create daily digest for end users
 */
const createDailyDigest = async () => {
  try {
    // Get summary of orders for today
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today.toDate(), $lt: tomorrow.toDate() }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);

    if (todayStats.length === 0) {
      console.log('📊 No orders today - skipping daily digest');
      return;
    }

    // Find end users to send digest to
    const User = require('../models/User');
    const endUsers = await User.find({ role: 'end_user' });

    for (const user of endUsers) {
      const totalOrders = todayStats.reduce((sum, stat) => sum + stat.count, 0);
      const totalValue = todayStats.reduce((sum, stat) => sum + stat.totalValue, 0);

      const digestMessage = `Daily Summary ${today.format('DD/MM/YYYY')}:\n` +
        `• Total Orders: ${totalOrders}\n` +
        `• Total Value: ₹${totalValue.toFixed(2)}\n` +
        `• Status Breakdown: ${todayStats.map(s => `${s._id}: ${s.count}`).join(', ')}`;

      const notification = new Notification({
        recipientId: user._id,
        type: 'system',
        title: `Daily Business Summary - ${today.format('DD MMM YYYY')}`,
        message: digestMessage,
        priority: 'low'
      });

      await notification.save();
    }

    console.log(`📊 Created daily digest for ${endUsers.length} end users`);
  } catch (error) {
    console.error('❌ Error creating daily digest:', error);
  }
};

/**
 * Clean up old notifications
 */
const cleanupOldNotifications = async () => {
  try {
    const retentionDays = parseInt(process.env.NOTIFICATION_RETENTION_DAYS) || 30;
    const cutoffDate = moment().subtract(retentionDays, 'days').toDate();

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
      status: 'sent'
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  }
};

/**
 * Send pending notifications (if you implement email/SMS)
 */
const processPendingNotifications = async () => {
  try {
    const pendingNotifications = await Notification.getPendingNotifications();

    for (const notification of pendingNotifications) {
      try {
        // Here you would implement actual email/SMS sending
        // For now, we'll just mark as sent and log
        
        console.log(`📤 Processing notification: ${notification.title} to ${notification.recipientId.email}`);
        
        // Simulate sending
        if (notification.channels.includes('email')) {
          console.log(`📧 Would send email to: ${notification.recipientId.email}`);
        }
        
        if (notification.channels.includes('sms')) {
          console.log(`📱 Would send SMS to: ${notification.recipientId.phone}`);
        }

        await notification.markAsSent();
      } catch (error) {
        console.error(`❌ Failed to send notification ${notification._id}:`, error);
        await notification.markAsFailed(error);
      }
    }

    if (pendingNotifications.length > 0) {
      console.log(`📤 Processed ${pendingNotifications.length} pending notifications`);
    }
  } catch (error) {
    console.error('❌ Error processing pending notifications:', error);
  }
};

// Auto-start the scheduler when the module is loaded
initNotificationScheduler();

module.exports = {
  initNotificationScheduler,
  createPickupReminders,
  createReturnReminders,
  createLateReturnNotices,
  createPaymentDueReminders,
  createDailyDigest,
  cleanupOldNotifications,
  processPendingNotifications
};
