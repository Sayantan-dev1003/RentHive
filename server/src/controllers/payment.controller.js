const Payment = require('../models/Payment');
const Order = require('../models/Order');
const PickupSlot = require('../models/PickupSlot');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');
const { processPayment, processRefund, getPaymentStats } = require('../utils/dummyPayment');
const { emitOrderUpdate } = require('../utils/socket');

/**
 * Process payment for an order
 * POST /api/payments/process
 */
const processOrderPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, method = 'mock', forceFail = false } = req.body;

  // Validate required fields
  if (!orderId || !amount || amount <= 0) {
    throw createValidationError('Order ID and positive amount are required');
  }

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw createNotFoundError('Order');
  }

  // Check if user can make payment for this order
  if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
    throw createValidationError('You can only make payments for your own orders');
  }

  // Check if order can accept payments
  if (order.status === 'cancelled') {
    throw createValidationError('Cannot process payment for cancelled order');
  }

  if (order.paymentStatus === 'paid') {
    throw createValidationError('Order is already fully paid');
  }

  // Check amount doesn't exceed remaining balance
  const totalPaid = await getTotalPaidForOrder(orderId);
  const remainingAmount = order.totalAmount - totalPaid;

  if (amount > remainingAmount) {
    throw createValidationError(`Payment amount (₹${amount}) exceeds remaining balance (₹${remainingAmount})`);
  }

  try {
    // Process payment using dummy payment service
    const paymentResult = await processPayment({
      orderId,
      amount,
      method,
      forceFail
    });

    // If payment is successful and order is now fully paid, get available pickup slots
    let availablePickupSlots = null;
    const updatedOrder = await Order.findById(orderId);
    
    if (paymentResult.success && updatedOrder.paymentStatus === 'paid') {
      // Get available pickup slots for the next 7 days
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      
      availablePickupSlots = await PickupSlot.findAvailableSlots(
        tomorrow.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );

      // Emit real-time update about payment success and pickup availability
      emitOrderUpdate(orderId, {
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        message: 'Payment successful - Please select pickup slot',
        availablePickupSlots: availablePickupSlots.length
      });
    }

    res.status(paymentResult.success ? 200 : 400).json({
      success: paymentResult.success,
      message: paymentResult.message,
      data: {
        payment: paymentResult.paymentRecord,
        transactionId: paymentResult.transactionId,
        gatewayResponse: paymentResult.gatewayResponse,
        order: updatedOrder,
        ...(availablePickupSlots && {
          pickupSlots: {
            available: availablePickupSlots,
            message: 'Payment successful! Please select a pickup slot to complete your order.',
            nextStep: 'pickup_slot_selection'
          }
        })
      }
    });
  } catch (error) {
    throw new Error(`Payment processing failed: ${error.message}`);
  }
});

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id)
    .populate('orderId', 'customerId totalAmount status')
    .populate('createdBy', 'name email');

  if (!payment) {
    throw createNotFoundError('Payment');
  }

  // Check if user can access this payment
  if (req.user.role === 'customer') {
    await payment.populate('orderId.customerId', 'name email');
    if (payment.orderId.customerId._id.toString() !== req.user._id.toString()) {
      throw createNotFoundError('Payment');
    }
  }

  res.status(200).json({
    success: true,
    data: {
      payment
    }
  });
});

/**
 * Get payments for an order
 * GET /api/payments/order/:orderId
 */
const getOrderPayments = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Check if order exists and user has access
  const order = await Order.findById(orderId);
  if (!order) {
    throw createNotFoundError('Order');
  }

  if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
    throw createNotFoundError('Order');
  }

  const payments = await Payment.find({ orderId })
    .sort({ createdAt: -1 });

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      payments,
      summary: {
        totalPaid,
        remainingAmount: order.totalAmount - totalPaid,
        orderTotal: order.totalAmount,
        paymentCount: payments.length
      }
    }
  });
});

/**
 * Get all payments with filtering and pagination
 * GET /api/payments
 */
const getPayments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    method,
    startDate,
    endDate,
    customerId
  } = req.query;

  // Build query
  let query = {};

  if (status) {
    query.status = status;
  }

  if (method) {
    query.method = method;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // If user is customer, only show their payments
  if (req.user.role === 'customer' || customerId) {
    const targetCustomerId = req.user.role === 'customer' ? req.user._id : customerId;
    
    // Get orders for the customer
    const customerOrders = await Order.find({ customerId: targetCustomerId }).select('_id');
    const orderIds = customerOrders.map(order => order._id);
    query.orderId = { $in: orderIds };
  }

  // Execute query with pagination
  const payments = await Payment.find(query)
    .populate('orderId', 'customerId totalAmount status')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Refund a payment
 * POST /api/payments/:id/refund
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason = 'Refund requested' } = req.body;

  const payment = await Payment.findById(id);

  if (!payment) {
    throw createNotFoundError('Payment');
  }

  if (!payment.isRefundable) {
    throw createValidationError('Payment is not refundable');
  }

  const refundAmount = amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw createValidationError('Refund amount cannot exceed payment amount');
  }

  try {
    const refundResult = await processRefund(id, refundAmount, reason);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund: refundResult,
        payment: await Payment.findById(id)
      }
    });
  } catch (error) {
    throw new Error(`Refund processing failed: ${error.message}`);
  }
});

/**
 * Get payment statistics
 * GET /api/payments/stats
 */
const getPaymentStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const stats = await getPaymentStats(
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
      endDate || new Date()
    );

    // Get additional database stats
    const dbStats = await Payment.getStats(
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate || new Date()
    );

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        databaseStats: dbStats,
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate || new Date()
        }
      }
    });
  } catch (error) {
    throw new Error(`Failed to get payment statistics: ${error.message}`);
  }
});

/**
 * Retry failed payment
 * POST /api/payments/:id/retry
 */
const retryPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id).populate('orderId');

  if (!payment) {
    throw createNotFoundError('Payment');
  }

  if (payment.status !== 'failed') {
    throw createValidationError('Can only retry failed payments');
  }

  try {
    // Process payment again
    const paymentResult = await processPayment({
      orderId: payment.orderId._id,
      amount: payment.amount,
      method: payment.method,
      forceFail: false
    });

    res.status(paymentResult.success ? 200 : 400).json({
      success: paymentResult.success,
      message: `Payment retry ${paymentResult.success ? 'successful' : 'failed'}`,
      data: {
        originalPayment: payment,
        newPayment: paymentResult.paymentRecord,
        transactionId: paymentResult.transactionId
      }
    });
  } catch (error) {
    throw new Error(`Payment retry failed: ${error.message}`);
  }
});

/**
 * Get payment methods and their statistics
 * GET /api/payments/methods
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await Payment.aggregate([
    {
      $group: {
        _id: '$method',
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$successfulTransactions', '$totalTransactions'] },
            100
          ]
        }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      methods,
      available: ['mock', 'razorpay', 'stripe', 'paypal', 'cash']
    }
  });
});

/**
 * Helper function to get total paid amount for an order
 */
const getTotalPaidForOrder = async (orderId) => {
  const payments = await Payment.find({
    orderId,
    status: 'completed'
  });

  return payments.reduce((total, payment) => total + payment.amount, 0);
};

module.exports = {
  processOrderPayment,
  getPaymentById,
  getOrderPayments,
  getPayments,
  refundPayment,
  getPaymentStatistics,
  retryPayment,
  getPaymentMethods
};
