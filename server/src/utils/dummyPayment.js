const shortid = require('shortid');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

/**
 * Process a dummy payment for testing purposes
 * @param {Object} paymentData - Payment data {orderId, amount, method, forceFail}
 * @returns {Promise<Object>} Payment result
 */
const processPayment = async (paymentData) => {
  const { orderId, amount, method = 'mock', forceFail = false } = paymentData;

  try {
    // Validate input
    if (!orderId || !amount || amount <= 0) {
      throw new Error('Invalid payment data: orderId and positive amount are required');
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Generate mock transaction ID
    const transactionId = `mock_tx_${shortid.generate()}`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Determine payment success (95% success rate unless forceFail is true)
    const shouldSucceed = !forceFail && Math.random() > 0.05;

    if (shouldSucceed) {
      // Create successful payment record
      const payment = new Payment({
        orderId,
        amount,
        method,
        transactionId,
        status: 'completed',
        paymentGatewayResponse: new Map([
          ['gateway', 'mock'],
          ['timestamp', new Date().toISOString()],
          ['reference', transactionId],
          ['authCode', `AUTH${Math.random().toString(36).substr(2, 9).toUpperCase()}`]
        ]),
        paidAt: new Date()
      });

      const savedPayment = await payment.save();

      // Update order payment status
      await updateOrderPaymentStatus(order, amount);

      return {
        success: true,
        transactionId,
        paymentRecord: savedPayment,
        message: 'Payment processed successfully',
        gatewayResponse: {
          status: 'success',
          reference: transactionId,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // Create failed payment record
      const failureReasons = [
        'Insufficient funds',
        'Card declined',
        'Network error',
        'Invalid card details',
        'Transaction timeout'
      ];
      
      const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      const payment = new Payment({
        orderId,
        amount,
        method,
        transactionId,
        status: 'failed',
        failureReason,
        paymentGatewayResponse: new Map([
          ['gateway', 'mock'],
          ['timestamp', new Date().toISOString()],
          ['reference', transactionId],
          ['errorCode', `ERR${Math.floor(Math.random() * 9000) + 1000}`],
          ['errorMessage', failureReason]
        ])
      });

      const savedPayment = await payment.save();

      return {
        success: false,
        transactionId,
        paymentRecord: savedPayment,
        message: `Payment failed: ${failureReason}`,
        gatewayResponse: {
          status: 'failed',
          reference: transactionId,
          error: failureReason,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    // Create error payment record if possible
    try {
      const transactionId = `mock_tx_${shortid.generate()}`;
      const payment = new Payment({
        orderId,
        amount: amount || 0,
        method: method || 'mock',
        transactionId,
        status: 'failed',
        failureReason: error.message,
        paymentGatewayResponse: new Map([
          ['gateway', 'mock'],
          ['timestamp', new Date().toISOString()],
          ['reference', transactionId],
          ['errorType', 'processing_error'],
          ['errorMessage', error.message]
        ])
      });

      await payment.save();
    } catch (saveError) {
      console.error('Failed to save error payment record:', saveError);
    }

    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

/**
 * Update order payment status based on payment amount
 * @param {Object} order - Order document
 * @param {Number} paidAmount - Amount paid
 */
const updateOrderPaymentStatus = async (order, paidAmount) => {
  try {
    const totalPaid = await getTotalPaidAmount(order._id) + paidAmount;
    
    // Determine payment status
    let paymentStatus = 'pending';
    
    if (totalPaid >= order.totalAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid >= order.depositAmount && order.depositAmount > 0) {
      paymentStatus = 'partial';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }

    // Update order
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus,
      $inc: { paidAmount: paidAmount }
    });

  } catch (error) {
    console.error('Failed to update order payment status:', error);
    throw error;
  }
};

/**
 * Get total paid amount for an order
 * @param {String} orderId - Order ID
 * @returns {Promise<Number>} Total paid amount
 */
const getTotalPaidAmount = async (orderId) => {
  try {
    const payments = await Payment.find({
      orderId,
      status: 'completed'
    });

    return payments.reduce((total, payment) => total + payment.amount, 0);
  } catch (error) {
    console.error('Failed to get total paid amount:', error);
    return 0;
  }
};

/**
 * Simulate different payment methods
 * @param {String} method - Payment method
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Method-specific response
 */
const simulatePaymentMethod = async (method, paymentData) => {
  const { amount } = paymentData;
  
  switch (method) {
    case 'razorpay':
      return {
        gateway: 'razorpay',
        order_id: `order_${shortid.generate()}`,
        payment_id: `pay_${shortid.generate()}`,
        signature: `signature_${shortid.generate()}`,
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR'
      };
      
    case 'stripe':
      return {
        gateway: 'stripe',
        payment_intent: `pi_${shortid.generate()}`,
        client_secret: `pi_${shortid.generate()}_secret_${shortid.generate()}`,
        amount: amount * 100, // Stripe uses smallest currency unit
        currency: 'inr'
      };
      
    case 'paypal':
      return {
        gateway: 'paypal',
        payment_id: `PAY-${shortid.generate()}`,
        payer_id: `PAYER${shortid.generate()}`,
        amount: amount,
        currency: 'USD'
      };
      
    case 'cash':
      return {
        gateway: 'cash',
        receipt_number: `CASH${Date.now()}`,
        amount: amount,
        currency: 'INR',
        collected_by: 'admin_user'
      };
      
    default:
      return {
        gateway: 'mock',
        reference: `mock_${shortid.generate()}`,
        amount: amount,
        currency: 'INR'
      };
  }
};

/**
 * Process refund for a payment or order
 * @param {String} orderIdOrPaymentId - Order ID or Payment ID to refund
 * @param {Number} refundAmount - Amount to refund (optional, defaults to full amount)
 * @param {String} reason - Refund reason
 * @returns {Promise<Object>} Refund result
 */
const processRefund = async (orderIdOrPaymentId, refundAmount, reason = 'Order cancellation') => {
  try {
    let payment;
    let isOrderId = false;
    
    // Try to find by payment ID first
    payment = await Payment.findById(orderIdOrPaymentId);
    
    // If not found, try to find the latest completed payment for this order
    if (!payment) {
      payment = await Payment.findOne({
        orderId: orderIdOrPaymentId,
        status: 'completed'
      }).sort({ createdAt: -1 });
      isOrderId = true;
    }
    
    if (!payment) {
      throw new Error('No completed payment found for refund');
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmountFinal = refundAmount || payment.amount;
    
    if (refundAmountFinal > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // Generate refund transaction ID
    const refundId = `refund_${shortid.generate()}`;
    
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 98% success rate for refunds
    const shouldSucceed = Math.random() > 0.02;

    if (shouldSucceed) {
      // Create refund record
      const refundData = {
        refundId,
        amount: refundAmountFinal,
        reason,
        processedAt: new Date(),
        status: 'processed',
        gatewayResponse: {
          gateway: payment.method,
          refundReference: refundId,
          originalTransactionId: payment.transactionId,
          timestamp: new Date().toISOString()
        }
      };

      // Update payment with refund details
      await Payment.findByIdAndUpdate(payment._id, {
        status: 'refunded',
        refundDetails: refundData,
        refundAmount: refundAmountFinal
      });

      // If this was an order refund, update order payment status
      if (isOrderId) {
        await Order.findByIdAndUpdate(orderIdOrPaymentId, {
          paymentStatus: 'refunded'
        });
      }

      return {
        success: true,
        refundId,
        refundAmount: refundAmountFinal,
        originalPaymentId: payment._id,
        message: 'Refund processed successfully',
        estimatedArrival: '3-5 business days',
        refundDetails: refundData
      };
    } else {
      throw new Error('Refund processing failed at payment gateway');
    }
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Get payment statistics for testing
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Payment statistics
 */
const getPaymentStats = async (startDate, endDate) => {
  try {
    const stats = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const methodStats = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    return {
      statusBreakdown: stats,
      methodBreakdown: methodStats,
      period: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    throw new Error(`Failed to get payment stats: ${error.message}`);
  }
};

module.exports = {
  processPayment,
  processRefund,
  simulatePaymentMethod,
  getPaymentStats,
  getTotalPaidAmount
};
