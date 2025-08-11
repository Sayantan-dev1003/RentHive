/**
 * Report Controller
 * Enhanced reporting with export capabilities
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { asyncHandler, createValidationError } = require('../middlewares/errorHandler');
const { generateReportPDF } = require('../utils/pdf');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Get most rented products report
 * GET /api/reports/most-rented-products
 */
const getMostRentedProducts = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const mostRentedProducts = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalRentals: { $sum: 1 },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.priceApplied.totalPrice' },
        averageRentalDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$items.rentalDuration.endDate', '$items.rentalDuration.startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
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
        productName: '$product.name',
        category: '$product.category',
        totalRentals: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        averageRentalDuration: { $round: ['$averageRentalDuration', 1] }
      }
    },
    { $sort: { totalRentals: -1 } },
    { $limit: parseInt(limit) }
  ]);

  res.status(200).json({
    success: true,
    data: {
      products: mostRentedProducts,
      period: { startDate, endDate },
      generatedAt: new Date()
    }
  });
});

/**
 * Get total revenue report
 * GET /api/reports/total-revenue
 */
const getTotalRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'month' } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Group by format based on groupBy parameter
  let groupFormat;
  switch (groupBy) {
    case 'day':
      groupFormat = '%Y-%m-%d';
      break;
    case 'week':
      groupFormat = '%Y-%U';
      break;
    case 'month':
      groupFormat = '%Y-%m';
      break;
    case 'year':
      groupFormat = '%Y';
      break;
    default:
      groupFormat = '%Y-%m';
  }

  const revenueData = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
        totalLateFees: { $sum: '$lateFee' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Calculate totals
  const summary = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
        totalLateFees: { $sum: '$lateFee' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: summary[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalLateFees: 0
      },
      breakdown: revenueData,
      period: { startDate, endDate },
      groupBy,
      generatedAt: new Date()
    }
  });
});

/**
 * Get top customers report
 * GET /api/reports/top-customers
 */
const getTopCustomers = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const topCustomers = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$customerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' },
        totalLateFees: { $sum: '$lateFee' }
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
        customerName: '$customer.name',
        customerEmail: '$customer.email',
        customerPhone: '$customer.phone',
        totalOrders: 1,
        totalSpent: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        lastOrderDate: 1,
        totalLateFees: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: parseInt(limit) }
  ]);

  res.status(200).json({
    success: true,
    data: {
      customers: topCustomers,
      period: { startDate, endDate },
      generatedAt: new Date()
    }
  });
});

/**
 * Get inventory report
 * GET /api/reports/inventory
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  const { category, lowStockThreshold = 5 } = req.query;

  // Build category filter
  const categoryFilter = {};
  if (category) {
    categoryFilter.category = category;
  }

  const inventoryData = await Product.aggregate([
    { $match: { ...categoryFilter, isActive: true } },
    {
      $addFields: {
        currentAvailableStock: {
          $subtract: [
            '$stock',
            {
              $size: {
                $filter: {
                  input: '$availability',
                  as: 'avail',
                  cond: {
                    $and: [
                      { $lte: ['$$avail.startDate', new Date()] },
                      { $gte: ['$$avail.endDate', new Date()] }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    },
    {
      $addFields: {
        stockStatus: {
          $cond: {
            if: { $lte: ['$currentAvailableStock', parseInt(lowStockThreshold)] },
            then: 'low',
            else: 'adequate'
          }
        }
      }
    },
    {
      $project: {
        name: 1,
        category: 1,
        totalStock: '$stock',
        currentAvailableStock: 1,
        stockStatus: 1,
        rentable: 1,
        pricing: 1
      }
    },
    { $sort: { currentAvailableStock: 1 } }
  ]);

  // Summary statistics
  const summary = {
    totalProducts: inventoryData.length,
    lowStockItems: inventoryData.filter(item => item.stockStatus === 'low').length,
    totalStockUnits: inventoryData.reduce((sum, item) => sum + item.totalStock, 0),
    totalAvailableUnits: inventoryData.reduce((sum, item) => sum + item.currentAvailableStock, 0)
  };

  res.status(200).json({
    success: true,
    data: {
      summary,
      inventory: inventoryData,
      filters: { category, lowStockThreshold },
      generatedAt: new Date()
    }
  });
});

/**
 * Export reports in PDF or CSV format
 * GET /api/reports/export
 */
const exportReport = asyncHandler(async (req, res) => {
  const { 
    type, 
    format = 'pdf', 
    startDate, 
    endDate,
    ...reportParams 
  } = req.query;

  if (!type) {
    throw createValidationError('Report type is required');
  }

  if (!['pdf', 'csv'].includes(format)) {
    throw createValidationError('Format must be either pdf or csv');
  }

  let reportData;
  let filename;

  // Generate report data based on type
  switch (type) {
    case 'revenue':
      reportData = await generateRevenueReport(startDate, endDate, reportParams);
      filename = `revenue-report-${moment().format('YYYY-MM-DD')}`;
      break;
    case 'products':
      reportData = await generateProductReport(startDate, endDate, reportParams);
      filename = `product-report-${moment().format('YYYY-MM-DD')}`;
      break;
    case 'customers':
      reportData = await generateCustomerReport(startDate, endDate, reportParams);
      filename = `customer-report-${moment().format('YYYY-MM-DD')}`;
      break;
    case 'inventory':
      reportData = await generateInventoryReportData(reportParams);
      filename = `inventory-report-${moment().format('YYYY-MM-DD')}`;
      break;
    case 'orders':
      reportData = await generateOrderReport(startDate, endDate, reportParams);
      filename = `order-report-${moment().format('YYYY-MM-DD')}`;
      break;
    default:
      throw createValidationError('Invalid report type');
  }

  const exportDir = path.join(process.cwd(), 'tmp', 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  let filePath;
  
  if (format === 'pdf') {
    filePath = path.join(exportDir, `${filename}.pdf`);
    await generateReportPDF(reportData, type, filePath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  } else {
    filePath = path.join(exportDir, `${filename}.csv`);
    await generateCSVReport(reportData, type, filePath);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  }

  // Stream file to response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  // Clean up file after streaming
  fileStream.on('end', () => {
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 1000);
  });
});

// Helper functions for generating report data
const generateRevenueReport = async (startDate, endDate, params) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const summary = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
        }
      }
    }
  ]);

  const monthlyBreakdown = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrder: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return {
    type: 'revenue',
    summary: summary[0] || {},
    monthlyBreakdown,
    period: { startDate, endDate }
  };
};

const generateProductReport = async (startDate, endDate, params) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const products = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalRentals: { $sum: 1 },
        totalRevenue: { $sum: '$items.priceApplied.totalPrice' }
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
        name: '$product.name',
        category: '$product.category',
        totalRentals: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalRentals: -1 } }
  ]);

  return {
    type: 'products',
    products,
    period: { startDate, endDate }
  };
};

const generateCustomerReport = async (startDate, endDate, params) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const customers = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$customerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' }
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
        name: '$customer.name',
        email: '$customer.email',
        totalOrders: 1,
        totalSpent: 1,
        lastOrderDate: 1
      }
    },
    { $sort: { totalSpent: -1 } }
  ]);

  return {
    type: 'customers',
    customers,
    period: { startDate, endDate }
  };
};

const generateInventoryReportData = async (params) => {
  const products = await Product.find({ isActive: true });
  
  return {
    type: 'inventory',
    products: products.map(product => ({
      name: product.name,
      category: product.category,
      stock: product.stock,
      currentAvailableStock: product.currentAvailableStock,
      dailyRate: product.pricing.day
    }))
  };
};

const generateOrderReport = async (startDate, endDate, params) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(dateFilter)
    .populate('customerId', 'name email')
    .select('_id customerId status totalAmount paymentStatus createdAt')
    .sort({ createdAt: -1 })
    .limit(1000); // Limit for performance

  const orderSummary = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    }
  ]);

  return {
    type: 'orders',
    orderSummary: orderSummary[0] || {},
    orders: orders.map(order => ({
      _id: order._id,
      customerName: order.customerId?.name || 'N/A',
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    })),
    period: { startDate, endDate }
  };
};

const generateCSVReport = async (reportData, type, filePath) => {
  return new Promise((resolve, reject) => {
    const csvStream = csv.format({ headers: true });
    const writableStream = fs.createWriteStream(filePath);

    csvStream.pipe(writableStream);

    try {
      switch (type) {
        case 'revenue':
          if (reportData.monthlyBreakdown) {
            reportData.monthlyBreakdown.forEach(row => {
              csvStream.write({
                Month: row._id,
                'Total Revenue': row.totalRevenue,
                'Total Orders': row.totalOrders,
                'Average Order': row.averageOrder
              });
            });
          }
          break;

        case 'products':
          if (reportData.products) {
            reportData.products.forEach(row => {
              csvStream.write({
                'Product Name': row.name,
                Category: row.category,
                'Total Rentals': row.totalRentals,
                'Total Revenue': row.totalRevenue
              });
            });
          }
          break;

        case 'customers':
          if (reportData.customers) {
            reportData.customers.forEach(row => {
              csvStream.write({
                'Customer Name': row.name,
                Email: row.email,
                'Total Orders': row.totalOrders,
                'Total Spent': row.totalSpent,
                'Last Order': moment(row.lastOrderDate).format('YYYY-MM-DD')
              });
            });
          }
          break;

        case 'inventory':
          if (reportData.products) {
            reportData.products.forEach(row => {
              csvStream.write({
                'Product Name': row.name,
                Category: row.category,
                'Total Stock': row.stock,
                'Available Stock': row.currentAvailableStock,
                'Daily Rate': row.dailyRate
              });
            });
          }
          break;

        case 'orders':
          if (reportData.orders) {
            reportData.orders.forEach(row => {
              csvStream.write({
                'Order ID': row._id.toString().slice(-6).toUpperCase(),
                'Customer Name': row.customerName,
                Status: row.status,
                Amount: row.totalAmount,
                Date: moment(row.createdAt).format('YYYY-MM-DD')
              });
            });
          }
          break;
      }

      csvStream.end();
      
      writableStream.on('finish', () => {
        resolve(filePath);
      });

      writableStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getMostRentedProducts,
  getTotalRevenue,
  getTopCustomers,
  getInventoryReport,
  exportReport
};

