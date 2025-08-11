const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { asyncHandler, createValidationError } = require('../middlewares/errorHandler');
const moment = require('moment');

/**
 * Get most rented products report
 * GET /api/reports/most-rented-products
 */
const getMostRentedProducts = asyncHandler(async (req, res) => {
  const { start, end, limit = 10 } = req.query;

  // Build date filter
  const dateFilter = {};
  if (start || end) {
    dateFilter.createdAt = {};
    if (start) dateFilter.createdAt.$gte = new Date(start);
    if (end) dateFilter.createdAt.$lte = new Date(end);
  }

  // Add status filter to exclude cancelled orders
  dateFilter.status = { $ne: 'cancelled' };

  const pipeline = [
    { $match: dateFilter },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalRentals: { $sum: 1 },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.priceApplied.totalPrice' },
        averagePrice: { $avg: '$items.priceApplied.totalPrice' },
        uniqueCustomers: { $addToSet: '$customerId' }
      }
    },
    {
      $addFields: {
        uniqueCustomerCount: { $size: '$uniqueCustomers' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        productName: '$product.name',
        category: '$product.category',
        totalRentals: 1,
        totalQuantity: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averagePrice: { $round: ['$averagePrice', 2] },
        uniqueCustomerCount: 1
      }
    },
    { $sort: { totalRentals: -1 } },
    { $limit: parseInt(limit) }
  ];

  const mostRentedProducts = await Order.aggregate(pipeline);

  res.status(200).json({
    success: true,
    data: {
      products: mostRentedProducts,
      period: { start, end },
      reportGenerated: new Date()
    }
  });
});

/**
 * Get total revenue report
 * GET /api/reports/total-revenue
 */
const getTotalRevenue = asyncHandler(async (req, res) => {
  const { start, end, groupBy = 'month' } = req.query;

  // Build date filter
  const dateFilter = {};
  if (start || end) {
    dateFilter.paidAt = {};
    if (start) dateFilter.paidAt.$gte = new Date(start);
    if (end) dateFilter.paidAt.$lte = new Date(end);
  }

  // Only include completed payments
  dateFilter.status = 'completed';

  // Build group stage based on groupBy parameter
  let groupStage;
  switch (groupBy) {
    case 'day':
      groupStage = {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        }
      };
      break;
    case 'week':
      groupStage = {
        _id: {
          year: { $year: '$paidAt' },
          week: { $week: '$paidAt' }
        }
      };
      break;
    case 'year':
      groupStage = {
        _id: {
          year: { $year: '$paidAt' }
        }
      };
      break;
    default: // month
      groupStage = {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' }
        }
      };
  }

  const pipeline = [
    { $match: dateFilter },
    {
      $group: {
        ...groupStage,
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    },
    {
      $addFields: {
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averageTransaction: { $round: ['$averageTransaction', 2] }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
  ];

  const revenueData = await Payment.aggregate(pipeline);

  // Get overall totals
  const totalsPipeline = [
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        grandTotal: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    }
  ];

  const totals = await Payment.aggregate(totalsPipeline);

  res.status(200).json({
    success: true,
    data: {
      revenueBreakdown: revenueData,
      totals: totals[0] || { grandTotal: 0, totalTransactions: 0, averageTransaction: 0 },
      period: { start, end },
      groupBy,
      reportGenerated: new Date()
    }
  });
});

/**
 * Get top customers report
 * GET /api/reports/top-customers
 */
const getTopCustomers = asyncHandler(async (req, res) => {
  const { start, end, limit = 10 } = req.query;

  // Build date filter
  const dateFilter = {};
  if (start || end) {
    dateFilter.createdAt = {};
    if (start) dateFilter.createdAt.$gte = new Date(start);
    if (end) dateFilter.createdAt.$lte = new Date(end);
  }

  // Exclude cancelled orders
  dateFilter.status = { $ne: 'cancelled' };

  const pipeline = [
    { $match: dateFilter },
    {
      $group: {
        _id: '$customerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        firstOrder: { $min: '$createdAt' },
        lastOrder: { $max: '$createdAt' },
        totalItems: { $sum: { $size: '$items' } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    {
      $project: {
        customerId: '$_id',
        customerName: '$customer.name',
        customerEmail: '$customer.email',
        customerPhone: '$customer.phone',
        totalOrders: 1,
        totalSpent: { $round: ['$totalSpent', 2] },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        firstOrder: 1,
        lastOrder: 1,
        totalItems: 1,
        customerSince: '$customer.createdAt'
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: parseInt(limit) }
  ];

  const topCustomers = await Order.aggregate(pipeline);

  res.status(200).json({
    success: true,
    data: {
      customers: topCustomers,
      period: { start, end },
      reportGenerated: new Date()
    }
  });
});

/**
 * Get order status distribution report
 * GET /api/reports/order-status
 */
const getOrderStatusReport = asyncHandler(async (req, res) => {
  const { start, end } = req.query;

  // Build date filter
  const dateFilter = {};
  if (start || end) {
    dateFilter.createdAt = {};
    if (start) dateFilter.createdAt.$gte = new Date(start);
    if (end) dateFilter.createdAt.$lte = new Date(end);
  }

  const pipeline = [
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        averageValue: { $avg: '$totalAmount' }
      }
    },
    {
      $addFields: {
        totalValue: { $round: ['$totalValue', 2] },
        averageValue: { $round: ['$averageValue', 2] }
      }
    },
    { $sort: { count: -1 } }
  ];

  const statusDistribution = await Order.aggregate(pipeline);

  // Get payment status distribution
  const paymentPipeline = [
    { $match: dateFilter },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    },
    {
      $addFields: {
        totalValue: { $round: ['$totalValue', 2] }
      }
    },
    { $sort: { count: -1 } }
  ];

  const paymentDistribution = await Order.aggregate(paymentPipeline);

  res.status(200).json({
    success: true,
    data: {
      orderStatus: statusDistribution,
      paymentStatus: paymentDistribution,
      period: { start, end },
      reportGenerated: new Date()
    }
  });
});

/**
 * Get inventory utilization report
 * GET /api/reports/inventory-utilization
 */
const getInventoryUtilization = asyncHandler(async (req, res) => {
  const { start, end } = req.query;

  // Get all active products
  const products = await Product.find({ isActive: true }).select('name category stock availability');

  const utilizationData = products.map(product => {
    // Calculate utilization metrics
    let totalReservations = 0;
    let activeReservations = 0;
    const now = new Date();

    if (start && end) {
      // Filter reservations by date range
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      const filteredReservations = product.availability.filter(reservation => {
        const resStart = new Date(reservation.startDate);
        const resEnd = new Date(reservation.endDate);
        // Check if reservation overlaps with the query period
        return resStart <= endDate && resEnd >= startDate;
      });
      
      totalReservations = filteredReservations.length;
      activeReservations = filteredReservations.filter(reservation => 
        new Date(reservation.startDate) <= now && new Date(reservation.endDate) >= now
      ).length;
    } else {
      totalReservations = product.availability.length;
      activeReservations = product.availability.filter(reservation => 
        new Date(reservation.startDate) <= now && new Date(reservation.endDate) >= now
      ).length;
    }

    const utilizationRate = product.stock > 0 ? (activeReservations / product.stock) * 100 : 0;

    return {
      productId: product._id,
      productName: product.name,
      category: product.category,
      totalStock: product.stock,
      activeReservations,
      availableStock: product.stock - activeReservations,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      totalBookings: totalReservations
    };
  });

  // Sort by utilization rate
  utilizationData.sort((a, b) => b.utilizationRate - a.utilizationRate);

  // Calculate category-wise utilization
  const categoryUtilization = {};
  utilizationData.forEach(item => {
    if (!categoryUtilization[item.category]) {
      categoryUtilization[item.category] = {
        totalStock: 0,
        activeReservations: 0,
        totalBookings: 0,
        productCount: 0
      };
    }
    
    const cat = categoryUtilization[item.category];
    cat.totalStock += item.totalStock;
    cat.activeReservations += item.activeReservations;
    cat.totalBookings += item.totalBookings;
    cat.productCount += 1;
  });

  // Calculate utilization rates for categories
  Object.keys(categoryUtilization).forEach(category => {
    const cat = categoryUtilization[category];
    cat.utilizationRate = cat.totalStock > 0 ? 
      Math.round((cat.activeReservations / cat.totalStock) * 10000) / 100 : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      products: utilizationData,
      categoryBreakdown: categoryUtilization,
      summary: {
        totalProducts: utilizationData.length,
        averageUtilization: utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / utilizationData.length || 0,
        highestUtilization: utilizationData[0]?.utilizationRate || 0,
        fullyUtilized: utilizationData.filter(item => item.utilizationRate >= 100).length
      },
      period: { start, end },
      reportGenerated: new Date()
    }
  });
});

/**
 * Get financial summary report
 * GET /api/reports/financial-summary
 */
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { start, end } = req.query;

  // Build date filter
  const dateFilter = {};
  if (start || end) {
    dateFilter.createdAt = {};
    if (start) dateFilter.createdAt.$gte = new Date(start);
    if (end) dateFilter.createdAt.$lte = new Date(end);
  }

  // Get order financial data
  const orderStats = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalDeposits: { $sum: '$depositAmount' },
        totalLateFees: { $sum: '$lateFee' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Get payment financial data
  const paymentFilter = { ...dateFilter, status: 'completed' };
  if (start || end) {
    paymentFilter.paidAt = dateFilter.createdAt;
    delete paymentFilter.createdAt;
  }

  const paymentStats = await Payment.aggregate([
    { $match: paymentFilter },
    {
      $group: {
        _id: null,
        totalCollected: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    }
  ]);

  // Get refund data
  const refundStats = await Payment.aggregate([
    { $match: { ...paymentFilter, status: 'refunded' } },
    {
      $group: {
        _id: null,
        totalRefunds: { $sum: '$refundDetails.refundAmount' },
        refundCount: { $sum: 1 }
      }
    }
  ]);

  const orderData = orderStats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalDeposits: 0,
    totalLateFees: 0,
    averageOrderValue: 0
  };

  const paymentData = paymentStats[0] || {
    totalCollected: 0,
    totalTransactions: 0,
    averageTransaction: 0
  };

  const refundData = refundStats[0] || {
    totalRefunds: 0,
    refundCount: 0
  };

  // Calculate net revenue
  const netRevenue = paymentData.totalCollected - (refundData.totalRefunds || 0);

  res.status(200).json({
    success: true,
    data: {
      orders: {
        ...orderData,
        totalRevenue: Math.round(orderData.totalRevenue * 100) / 100,
        averageOrderValue: Math.round(orderData.averageOrderValue * 100) / 100
      },
      payments: {
        ...paymentData,
        totalCollected: Math.round(paymentData.totalCollected * 100) / 100,
        averageTransaction: Math.round(paymentData.averageTransaction * 100) / 100
      },
      refunds: {
        ...refundData,
        totalRefunds: Math.round((refundData.totalRefunds || 0) * 100) / 100
      },
      summary: {
        netRevenue: Math.round(netRevenue * 100) / 100,
        collectionRate: orderData.totalRevenue > 0 ? 
          Math.round((paymentData.totalCollected / orderData.totalRevenue) * 10000) / 100 : 0,
        refundRate: paymentData.totalCollected > 0 ? 
          Math.round(((refundData.totalRefunds || 0) / paymentData.totalCollected) * 10000) / 100 : 0
      },
      period: { start, end },
      reportGenerated: new Date()
    }
  });
});

/**
 * Export report data
 * GET /api/reports/export
 */
const exportReport = asyncHandler(async (req, res) => {
  const { type, format = 'json', start, end } = req.query;

  if (!type) {
    throw createValidationError('Report type is required');
  }

  let reportData;

  // Generate report based on type
  switch (type) {
    case 'revenue':
      const revenueReq = { query: { start, end } };
      const revenueRes = { 
        status: () => ({ json: (data) => { reportData = data; } })
      };
      await getTotalRevenue(revenueReq, revenueRes, () => {});
      break;
      
    case 'customers':
      const customersReq = { query: { start, end } };
      const customersRes = { 
        status: () => ({ json: (data) => { reportData = data; } })
      };
      await getTopCustomers(customersReq, customersRes, () => {});
      break;
      
    default:
      throw createValidationError('Invalid report type');
  }

  // Format response based on requested format
  if (format === 'csv') {
    // For CSV format, you would implement CSV conversion here
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.csv"`);
    res.status(200).send('CSV export not implemented yet');
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.json"`);
    res.status(200).json(reportData);
  }
});

module.exports = {
  getMostRentedProducts,
  getTotalRevenue,
  getTopCustomers,
  getOrderStatusReport,
  getInventoryUtilization,
  getFinancialSummary,
  exportReport
};
