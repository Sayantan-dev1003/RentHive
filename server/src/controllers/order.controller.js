const Order = require('../models/Order');
const Product = require('../models/Product');
const Pricelist = require('../models/Pricelist');
const Invoice = require('../models/Invoice');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');
const { calculatePrice, calculateLateFee } = require('../utils/pricingHelper');
const { isAvailable, reserveProduct, releaseReservation, checkMultipleAvailability } = require('../utils/availabilityHelper');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { processRefund } = require('../utils/dummyPayment');
const { emitOrderUpdate, emitProductUpdate } = require('../utils/socket');
const fs = require('fs');
const path = require('path');

/**
 * Create a quote for order items
 * POST /api/orders/quote
 */
const createQuote = asyncHandler(async (req, res) => {
  const { customerId, items, pricelistId } = req.body;

  // Validate required fields
  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    throw createValidationError('Customer ID and items array are required');
  }

  // Validate items format
  for (const item of items) {
    if (!item.productId || !item.quantity || !item.startDate || !item.endDate) {
      throw createValidationError('Each item must have productId, quantity, startDate, and endDate');
    }
  }

  // Get products and check availability
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== productIds.length) {
    throw createValidationError('One or more products not found or inactive');
  }

  // Create product map for easy lookup
  const productMap = {};
  products.forEach(product => {
    productMap[product._id.toString()] = product;
  });

  // Check availability for all items
  const availabilityCheck = await checkMultipleAvailability(items);
  
  const unavailableItems = [];
  for (const [productId, result] of Object.entries(availabilityCheck)) {
    if (!result.available) {
      unavailableItems.push({
        productId,
        productName: result.productName,
        reason: result.reason,
        availableQuantity: result.availableQuantity,
        requestedQuantity: result.requestedQuantity
      });
    }
  }

  if (unavailableItems.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Some items are not available',
      data: {
        unavailableItems
      }
    });
  }

  // Prepare items with product data for pricing
  const orderItems = items.map(item => ({
    product: productMap[item.productId],
    quantity: item.quantity,
    rentalDuration: {
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate)
    }
  }));

  // Get applicable pricelists
  let pricelists = [];
  if (pricelistId) {
    const specificPricelist = await Pricelist.findById(pricelistId);
    if (specificPricelist && specificPricelist.isCurrentlyValid) {
      pricelists = [specificPricelist];
    }
  } else {
    // Get all active pricelists
    pricelists = await Pricelist.findActiveForDate();
  }

  // Calculate pricing
  const pricingResult = calculatePrice(orderItems, pricelists);

  // Create quote object
  const quote = {
    quoteId: `QT${Date.now()}`,
    customerId,
    items: items.map((item, index) => ({
      ...item,
      productName: productMap[item.productId].name,
      pricing: pricingResult.breakdown[index]
    })),
    pricing: pricingResult,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
    createdAt: new Date()
  };

  res.status(200).json({
    success: true,
    message: 'Quote generated successfully',
    data: {
      quote
    }
  });
});

/**
 * Confirm an order (create actual order)
 * POST /api/orders
 */
const confirmOrder = asyncHandler(async (req, res) => {
  const { customerId, items, depositAmount = 0, notes, pricelistId, billingDetails } = req.body;

  // Validate required fields
  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    throw createValidationError('Customer ID and items array are required');
  }

  // Get products and validate
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== productIds.length) {
    throw createValidationError('One or more products not found or inactive');
  }

  const productMap = {};
  products.forEach(product => {
    productMap[product._id.toString()] = product;
  });

  // Final availability check
  const availabilityCheck = await checkMultipleAvailability(items);
  
  for (const [productId, result] of Object.entries(availabilityCheck)) {
    if (!result.available) {
      throw createValidationError(`Product ${result.productName} is no longer available`);
    }
  }

  // Prepare items with product data for pricing
  const orderItems = items.map(item => ({
    product: productMap[item.productId],
    quantity: item.quantity,
    rentalDuration: {
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate)
    }
  }));

  // Get applicable pricelists
  let pricelists = [];
  if (pricelistId) {
    const specificPricelist = await Pricelist.findById(pricelistId);
    if (specificPricelist && specificPricelist.isCurrentlyValid) {
      pricelists = [specificPricelist];
    }
  } else {
    pricelists = await Pricelist.findActiveForDate();
  }

  // Calculate pricing
  const pricingResult = calculatePrice(orderItems, pricelists);

  // Create order items with pricing
  const orderItemsWithPricing = items.map((item, index) => ({
    productId: item.productId,
    quantity: item.quantity,
    rentalDuration: {
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate)
    },
    priceApplied: {
      basePrice: pricingResult.breakdown[index].basePrice,
      discountAmount: pricingResult.breakdown[index].discountAmount,
      totalPrice: pricingResult.breakdown[index].finalPrice,
      pricelistId: pricingResult.breakdown[index].appliedPricelist?.id,
      breakdown: new Map(Object.entries(pricingResult.breakdown[index]))
    }
  }));

  // Create order
  const order = new Order({
    customerId,
    items: orderItemsWithPricing,
    status: 'reserved',
    depositAmount: parseFloat(depositAmount),
    totalAmount: pricingResult.summary.total,
    notes: notes ? notes.trim() : '',
    createdBy: req.user._id,
    billingDetails: billingDetails || null
  });

  // Determine payment status
  if (depositAmount >= pricingResult.summary.total) {
    order.paymentStatus = 'paid';
  } else if (depositAmount > 0) {
    order.paymentStatus = 'partial';
  }

  await order.save();

  // Reserve products
  for (const item of items) {
    await reserveProduct(
      item.productId,
      item.startDate,
      item.endDate,
      order._id,
      item.quantity
    );
  }

  // Generate invoice number
  const invoiceNumber = await Invoice.generateNextInvoiceNumber();

  // Create invoice
  const invoice = new Invoice({
    orderId: order._id,
    customerId,
    invoiceNumber: invoiceNumber,
    amount: pricingResult.summary.total,
    discountAmount: pricingResult.summary.totalDiscount,
    totalAmount: pricingResult.summary.total,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    paidAmount: depositAmount,
    lineItems: orderItemsWithPricing.map((item, index) => ({
      description: `Rental: ${productMap[item.productId].name}`,
      quantity: item.quantity,
      unitPrice: item.priceApplied.totalPrice / item.quantity,
      totalPrice: item.priceApplied.totalPrice,
      productId: item.productId,
      rentalPeriod: item.rentalDuration
    }))
  });

  await invoice.save();
  
  // Update order with invoice reference
  order.invoiceId = invoice._id;
  await order.save();

  // Populate order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name category pricing')
    .populate('invoiceId');

  res.status(201).json({
    success: true,
    message: 'Order confirmed successfully',
    data: {
      order: populatedOrder
    }
  });
});

/**
 * Get orders with filtering and pagination
 * GET /api/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    customerId,
    startDate,
    endDate
  } = req.query;

  // Build query based on user role
  let query = {};

  // If user is customer, only show their orders
  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (customerId) {
    query.customerId = customerId;
  }

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const orders = await Order.find(query)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name category images')
    .populate('invoiceId', 'invoiceNumber status totalAmount')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
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
 * Get single order by ID
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name category pricing images')
    .populate('invoiceId')
    .populate('createdBy', 'name email');

  if (!order) {
    throw createNotFoundError('Order');
  }

  // Check if user can access this order
  if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
    throw createNotFoundError('Order');
  }

  // Add computed fields
  const orderObj = order.toObject();
  orderObj.isOverdue = order.isOverdue;
  orderObj.daysOverdue = order.daysOverdue;
  orderObj.canPickup = order.canPickup();
  orderObj.canReturn = order.canReturn();

  res.status(200).json({
    success: true,
    data: {
      order: orderObj
    }
  });
});

/**
 * Mark order as picked up
 * PATCH /api/orders/:id/pickup
 */
const markPickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pickupDate, notes } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    throw createNotFoundError('Order');
  }

  if (!order.canPickup()) {
    throw createValidationError('Order cannot be picked up. Check status and payment.');
  }

  // Update order
  order.status = 'picked_up';
  order.pickupDate = pickupDate ? new Date(pickupDate) : new Date();
  
  if (notes) {
    order.notes = (order.notes || '') + `\nPickup notes: ${notes}`;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order marked as picked up successfully',
    data: {
      order
    }
  });
});

/**
 * Mark order as returned
 * PATCH /api/orders/:id/return
 */
const markReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { returnDate, notes, condition } = req.body;

  const order = await Order.findById(id)
    .populate('items.productId');

  if (!order) {
    throw createNotFoundError('Order');
  }

  if (!order.canReturn()) {
    throw createValidationError('Order cannot be returned. Check status.');
  }

  const actualReturnDate = returnDate ? new Date(returnDate) : new Date();

  // Calculate late fee if returned late
  const lateFee = calculateLateFee(order.items, actualReturnDate);

  // Update order
  order.status = 'returned';
  order.actualReturnDate = actualReturnDate;
  order.lateFee = lateFee;
  
  if (notes) {
    order.notes = (order.notes || '') + `\nReturn notes: ${notes}`;
  }

  if (condition) {
    order.notes = (order.notes || '') + `\nReturn condition: ${condition}`;
  }

  await order.save();

  // Release product reservations
  for (const item of order.items) {
    await releaseReservation(item.productId._id, order._id);
  }

  // Update invoice if there's a late fee
  if (lateFee > 0 && order.invoiceId) {
    await Invoice.findByIdAndUpdate(order.invoiceId, {
      $inc: { amount: lateFee, totalAmount: lateFee },
      notes: `Late fee added: ₹${lateFee}`
    });
  }

  res.status(200).json({
    success: true,
    message: `Order marked as returned successfully${lateFee > 0 ? ` with late fee of ₹${lateFee}` : ''}`,
    data: {
      order,
      lateFee
    }
  });
});



/**
 * Generate and get invoice information
 * GET /api/orders/:id/invoice
 */
const generateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name category pricing')
    .populate('invoiceId');

  if (!order) {
    throw createNotFoundError('Order');
  }

  if (!order.invoiceId) {
    throw createValidationError('No invoice found for this order');
  }

  // Check if user can access this order
  if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
    throw createNotFoundError('Order');
  }

  try {
    // Generate PDF if not already generated
    let pdfPath = order.invoiceId.pdfPath;
    if (!pdfPath) {
      console.log('Generating new PDF for order:', order._id);
      pdfPath = await generateInvoicePDF(order, order.invoiceId);
      
      // Update invoice with PDF path
      await Invoice.findByIdAndUpdate(order.invoiceId._id, {
        pdfPath
      });
      
      // Refresh the order to get updated invoice
      order.invoiceId.pdfPath = pdfPath;
    }

    // Return PDF directly
    if (pdfPath && fs.existsSync(pdfPath)) {
      console.log('Serving PDF file:', pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } else {
      console.log('PDF file not found, returning JSON response');
      res.status(200).json({
        success: true,
        message: 'Invoice generated successfully',
        data: {
          invoiceId: order.invoiceId._id,
          pdfPath: pdfPath,
          downloadUrl: `/api/orders/${id}/invoice/download`
        }
      });
    }
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to generate invoice: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Download invoice PDF file
 * GET /api/orders/:id/invoice/download
 */
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('customerId', 'name email phone')
    .populate('items.productId', 'name category pricing')
    .populate('invoiceId');

  if (!order) {
    throw createNotFoundError('Order');
  }

  if (!order.invoiceId) {
    throw createValidationError('No invoice found for this order');
  }

  // Check if user can access this order
  if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
    throw createNotFoundError('Order');
  }

  try {
    // Generate PDF if not already generated
    let pdfPath = order.invoiceId.pdfPath;
    if (!pdfPath) {
      console.log('Generating new PDF for download, order:', order._id);
      pdfPath = await generateInvoicePDF(order, order.invoiceId);
      
      // Update invoice with PDF path
      await Invoice.findByIdAndUpdate(order.invoiceId._id, {
        pdfPath
      });
    }
    
    if (pdfPath && fs.existsSync(pdfPath)) {
      console.log('Downloading PDF file:', pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } else {
      console.error('PDF file not found at path:', pdfPath);
      throw new Error('PDF file not found');
    }
  } catch (error) {
    console.error('Invoice download error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to download invoice: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Test invoice generation system
 * GET /api/orders/test-invoice
 */
const testInvoiceSystem = asyncHandler(async (req, res) => {
  try {
    // Check if required dependencies are available
    const PDFDocument = require('pdfkit');
    
    // Check if invoice directory can be created
    const invoiceDir = process.env.INVOICE_DIR || './tmp/invoices';
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    
    // Test PDF creation
    const testDoc = new PDFDocument();
    const testPath = path.join(invoiceDir, 'test.pdf');
    testDoc.pipe(fs.createWriteStream(testPath));
    testDoc.text('Test PDF Generation', 50, 50);
    testDoc.end();
    
    res.json({
      success: true,
      message: 'Invoice system is working correctly',
      data: {
        pdfkitAvailable: true,
        invoiceDirectory: invoiceDir,
        canCreateFiles: fs.existsSync(invoiceDir),
        testPdfCreated: testPath
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Invoice system test failed',
      error: error.message
    });
  }
});

/**
 * Get order statistics
 * GET /api/orders/stats
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Get order statistics
  const statusStats = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const paymentStats = await Order.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);

  const revenueStats = await Order.aggregate([
    { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      statusBreakdown: statusStats,
      paymentBreakdown: paymentStats,
      revenue: revenueStats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
      period: { startDate, endDate }
    }
  });
});

/**
 * Cancel an order
 * DELETE /api/orders/:id
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createNotFoundError('Order not found');
  }

  // Check if order can be cancelled
  if (['returned', 'cancelled'].includes(order.status)) {
    throw createValidationError('Order cannot be cancelled in current status');
  }

  // If order is picked up, require admin authorization
  if (order.status === 'picked_up' && req.user.role !== 'admin') {
    throw createValidationError('Cannot cancel order after pickup. Please contact support.');
  }

  // Release reserved products
  for (const item of order.items) {
    await releaseReservation(
      item.productId,
      item.rentalDuration.startDate,
      item.rentalDuration.endDate,
      order._id,
      item.quantity
    );

    // Emit product update
    const product = await Product.findById(item.productId);
    if (product) {
      emitProductUpdate(item.productId.toString(), {
        availability: product.availability,
        stock: product.stock
      });
    }
  }

  // Process refund if payment was made
  let refundDetails = null;
  if (['partial', 'paid'].includes(order.paymentStatus)) {
    try {
      refundDetails = await processRefund(id, null, reason || 'Order cancellation');
    } catch (refundError) {
      console.error('Refund processing failed:', refundError);
      // Continue with cancellation even if refund fails
    }
  }

  // Update order status
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  if (refundDetails) {
    order.paymentStatus = 'refunded';
  }

  await order.save();

  // Emit order update
  emitOrderUpdate(id, {
    status: order.status,
    cancelledAt: order.cancelledAt,
    cancelReason: order.cancelReason,
    refundDetails
  }, order.customerId.toString());

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: {
      order,
      refundDetails
    }
  });
});

/**
 * Extend order rental period
 * POST /api/orders/:id/extend
 */
const extendOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newEndDate, reason } = req.body;

  if (!newEndDate) {
    throw createValidationError('New end date is required');
  }

  const order = await Order.findById(id).populate('items.productId');
  
  if (!order) {
    throw createNotFoundError('Order not found');
  }

  // Check if order can be extended
  if (!['reserved', 'picked_up'].includes(order.status)) {
    throw createValidationError('Order cannot be extended in current status');
  }

  const newEndDateTime = new Date(newEndDate);
  
  // Validate new end date
  for (const item of order.items) {
    const currentEndDate = new Date(item.rentalDuration.endDate);
    
    if (newEndDateTime <= currentEndDate) {
      throw createValidationError('New end date must be after current end date');
    }

    // Check availability for extended period
    const isExtensionAvailable = await isAvailable(
      item.productId,
      currentEndDate,
      newEndDateTime,
      item.quantity
    );

    if (!isExtensionAvailable) {
      throw createValidationError(`Product ${item.productId.name} is not available for the extended period`);
    }
  }

  // Calculate additional cost
  let totalAdditionalCost = 0;
  const priceBreakdown = [];

  for (const item of order.items) {
    const currentEndDate = new Date(item.rentalDuration.endDate);
    const extensionDays = Math.ceil((newEndDateTime - currentEndDate) / (1000 * 60 * 60 * 24));
    
    // Use daily rate for extensions
    const dailyRate = item.productId.pricing.day;
    const extensionCost = dailyRate * item.quantity * extensionDays;
    
    totalAdditionalCost += extensionCost;
    
    priceBreakdown.push({
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      extensionDays,
      dailyRate,
      extensionCost
    });

    // Reserve the extended period
    await reserveProduct(
      item.productId._id,
      currentEndDate,
      newEndDateTime,
      order._id,
      item.quantity
    );

    // Update item end date
    item.rentalDuration.endDate = newEndDateTime;
  }

  // Update order
  order.returnDate = newEndDateTime;
  order.extendedUntil = newEndDateTime;
  order.totalAmount += totalAdditionalCost;

  // Add to extension history
  order.extensionHistory.push({
    originalEndDate: order.items[0].rentalDuration.endDate,
    newEndDate: newEndDateTime,
    additionalCost: totalAdditionalCost,
    reason: reason || 'Customer request'
  });

  await order.save();

  // Update invoice if exists
  const invoice = await Invoice.findOne({ orderId: id });
  if (invoice) {
    invoice.amount += totalAdditionalCost;
    invoice.extensionDetails = {
      additionalAmount: totalAdditionalCost,
      priceBreakdown,
      extendedUntil: newEndDateTime
    };
    await invoice.save();
  }

  // Emit updates
  emitOrderUpdate(id, {
    status: order.status,
    totalAmount: order.totalAmount,
    returnDate: order.returnDate,
    extensionHistory: order.extensionHistory
  }, order.customerId.toString());

  // Emit product updates
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      emitProductUpdate(item.productId._id.toString(), {
        availability: product.availability,
        stock: product.stock
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Order extended successfully',
    data: {
      order,
      additionalCost: totalAdditionalCost,
      priceBreakdown,
      newEndDate: newEndDateTime
    }
  });
});

module.exports = {
  createQuote,
  confirmOrder,
  getOrders,
  getOrderById,
  markPickup,
  markReturn,
  cancelOrder,
  extendOrder,
  generateInvoice,
  downloadInvoicePDF,
  testInvoiceSystem,
  getOrderStats
};
