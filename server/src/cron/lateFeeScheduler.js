/**
 * Late Fee Scheduler
 * Cron job to calculate and apply late fees for overdue orders
 */

const cron = require('node-cron');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { emitLateFeeUpdate, emitOrderUpdate } = require('../utils/socket');
const moment = require('moment');

/**
 * Calculate late fee for an order
 * @param {Object} order - Order document
 * @returns {Number} - Late fee amount
 */
const calculateLateFee = (order) => {
  const lateFeePerDay = parseFloat(process.env.LATE_FEE_PER_DAY) || 100;
  const today = new Date();
  
  // Find the latest return date from all items
  let latestReturnDate = null;
  order.items.forEach(item => {
    const itemReturnDate = new Date(item.rentalDuration.endDate);
    if (!latestReturnDate || itemReturnDate > latestReturnDate) {
      latestReturnDate = itemReturnDate;
    }
  });

  // Use extendedUntil if order was extended
  if (order.extendedUntil) {
    latestReturnDate = new Date(order.extendedUntil);
  }

  if (!latestReturnDate || today <= latestReturnDate) {
    return 0; // Not late
  }

  const daysLate = Math.ceil((today - latestReturnDate) / (1000 * 60 * 60 * 24));
  return daysLate * lateFeePerDay;
};

/**
 * Process overdue orders and apply late fees
 */
const processOverdueOrders = async () => {
  try {
    console.log('🕐 Running late fee calculation...');
    
    // Find orders that are potentially overdue
    const today = new Date();
    const overdueOrders = await Order.find({
      status: { $in: ['picked_up', 'late'] },
      $or: [
        { returnDate: { $lt: today } },
        { extendedUntil: { $lt: today } },
        { 
          'items.rentalDuration.endDate': { $lt: today },
          extendedUntil: { $exists: false }
        }
      ]
    }).populate('customerId', 'name email');

    let processedCount = 0;
    let updatedCount = 0;

    for (const order of overdueOrders) {
      processedCount++;
      
      // Calculate current late fee
      const currentLateFee = calculateLateFee(order);
      
      if (currentLateFee > 0 && currentLateFee !== order.lateFee) {
        const previousLateFee = order.lateFee || 0;
        const additionalLateFee = currentLateFee - previousLateFee;
        
        // Update order
        order.lateFee = currentLateFee;
        order.status = 'late';
        order.lastLateFeeUpdate = new Date();
        
        await order.save();
        updatedCount++;
        
        // Update invoice if exists
        const invoice = await Invoice.findOne({ orderId: order._id });
        if (invoice) {
          invoice.amount += additionalLateFee;
          invoice.lateFeeDetails = {
            totalLateFee: currentLateFee,
            additionalFee: additionalLateFee,
            updatedAt: new Date()
          };
          await invoice.save();
        }
        
        // Create notification for customer
        await Notification.create({
          recipientId: order.customerId._id,
          type: 'late_return',
          orderId: order._id,
          title: 'Late Fee Applied',
          message: `A late fee of ₹${additionalLateFee} has been applied to your order. Total late fee is now ₹${currentLateFee}. Please return the items immediately to avoid additional charges.`,
          priority: 'high',
          channels: ['email', 'in_app']
        });
        
        // Emit real-time updates
        emitLateFeeUpdate(
          order._id.toString(),
          order.customerId._id.toString(),
          additionalLateFee
        );
        
        emitOrderUpdate(
          order._id.toString(),
          {
            status: order.status,
            lateFee: order.lateFee,
            totalAmount: order.totalAmount + order.lateFee
          },
          order.customerId._id.toString()
        );
        
        console.log(`💰 Applied late fee of ₹${additionalLateFee} to order ${order._id} (Customer: ${order.customerId.name})`);
      }
    }
    
    console.log(`✅ Late fee calculation completed. Processed: ${processedCount}, Updated: ${updatedCount} orders`);
    
    // Log summary to notifications for admin
    if (updatedCount > 0) {
      // Find admin users to notify
      const User = require('../models/User');
      const adminUsers = await User.find({ role: 'admin' });
      
      for (const admin of adminUsers) {
        await Notification.create({
          recipientId: admin._id,
          type: 'system',
          title: 'Late Fee Processing Summary',
          message: `Late fee calculation completed. ${updatedCount} orders updated out of ${processedCount} overdue orders processed.`,
          priority: 'medium',
          channels: ['in_app']
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error in late fee calculation:', error);
    
    // Log error to admin notifications
    try {
      const User = require('../models/User');
      const adminUsers = await User.find({ role: 'admin' });
      
      for (const admin of adminUsers) {
        await Notification.create({
          recipientId: admin._id,
          type: 'system',
          title: 'Late Fee Calculation Error',
          message: `Error occurred during late fee calculation: ${error.message}`,
          priority: 'urgent',
          channels: ['email', 'in_app']
        });
      }
    } catch (notificationError) {
      console.error('Failed to create error notification:', notificationError);
    }
  }
};

/**
 * Get overdue orders summary (for manual checking)
 */
const getOverdueOrdersSummary = async () => {
  try {
    const today = new Date();
    
    const summary = await Order.aggregate([
      {
        $match: {
          status: { $in: ['picked_up', 'late'] },
          $or: [
            { returnDate: { $lt: today } },
            { extendedUntil: { $lt: today } },
            { 
              'items.rentalDuration.endDate': { $lt: today },
              extendedUntil: { $exists: false }
            }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalOverdueOrders: { $sum: 1 },
          totalLateFees: { $sum: '$lateFee' },
          avgLateFee: { $avg: '$lateFee' }
        }
      }
    ]);
    
    return summary[0] || {
      totalOverdueOrders: 0,
      totalLateFees: 0,
      avgLateFee: 0
    };
  } catch (error) {
    console.error('Error getting overdue summary:', error);
    return null;
  }
};

// Schedule the job to run daily at midnight
const scheduleLateFeeCalculation = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    await processOverdueOrders();
  }, {
    timezone: 'Asia/Kolkata',
    scheduled: true
  });
  
  // Also run every 6 hours for more frequent updates
  cron.schedule('0 */6 * * *', async () => {
    await processOverdueOrders();
  }, {
    timezone: 'Asia/Kolkata',
    scheduled: true
  });
  
  console.log('🕐 Late fee calculation scheduler initialized');
  console.log('📅 Will run daily at midnight and every 6 hours');
};

// Initialize the scheduler
scheduleLateFeeCalculation();

module.exports = {
  processOverdueOrders,
  getOverdueOrdersSummary,
  calculateLateFee
};
