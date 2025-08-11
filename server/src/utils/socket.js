/**
 * Socket.io Real-time Event Utility
 * Handles real-time stock, availability, and order updates
 */

let io = null;

/**
 * Initialize Socket.io instance
 * @param {Object} socketIO - Socket.io instance
 */
const initializeSocket = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Join user-specific room for personalized notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    });
    
    // Join product-specific room for product updates
    socket.on('join-product-room', (productId) => {
      socket.join(`product:${productId}`);
      console.log(`📦 Client joined product room: ${productId}`);
    });
    
    // Join order-specific room for order updates
    socket.on('join-order-room', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`📋 Client joined order room: ${orderId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Emit product availability update
 * @param {String} productId - Product ID
 * @param {Object} productData - Updated product data
 */
const emitProductUpdate = (productId, productData) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  // Emit to all clients interested in this product
  io.to(`product:${productId}`).emit('productUpdated', {
    productId,
    data: productData,
    timestamp: new Date()
  });
  
  // Also emit to general product updates channel
  io.emit('productAvailabilityChanged', {
    productId,
    availability: productData.availability,
    stock: productData.stock,
    timestamp: new Date()
  });
  
  console.log(`📦 Product update emitted for: ${productId}`);
};

/**
 * Emit order status update
 * @param {String} orderId - Order ID
 * @param {Object} orderData - Updated order data
 * @param {String} userId - Customer ID to notify
 */
const emitOrderUpdate = (orderId, orderData, userId) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  // Emit to order-specific room
  io.to(`order:${orderId}`).emit('orderUpdated', {
    orderId,
    data: orderData,
    timestamp: new Date()
  });
  
  // Emit to user-specific room if userId provided
  if (userId) {
    io.to(`user:${userId}`).emit('orderStatusChanged', {
      orderId,
      status: orderData.status,
      message: getOrderStatusMessage(orderData.status),
      timestamp: new Date()
    });
  }
  
  console.log(`📋 Order update emitted for: ${orderId}`);
};

/**
 * Emit stock alert when stock is low
 * @param {String} productId - Product ID
 * @param {Number} currentStock - Current stock level
 * @param {Number} threshold - Low stock threshold
 */
const emitStockAlert = (productId, currentStock, threshold = 5) => {
  if (!io || currentStock > threshold) {
    return;
  }
  
  io.emit('stockAlert', {
    productId,
    currentStock,
    threshold,
    message: `Low stock alert: Product ${productId} has only ${currentStock} units remaining`,
    timestamp: new Date()
  });
  
  console.log(`⚠️ Stock alert emitted for product: ${productId} (${currentStock} remaining)`);
};

/**
 * Emit late fee notification
 * @param {String} orderId - Order ID
 * @param {String} userId - Customer ID
 * @param {Number} lateFee - Late fee amount
 */
const emitLateFeeUpdate = (orderId, userId, lateFee) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('lateFeeApplied', {
    orderId,
    lateFee,
    message: `Late fee of ₹${lateFee} has been applied to your order`,
    timestamp: new Date()
  });
  
  console.log(`💰 Late fee notification emitted for order: ${orderId}`);
};

/**
 * Emit general notification
 * @param {String} userId - User ID to notify
 * @param {Object} notification - Notification data
 */
const emitNotification = (userId, notification) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date()
  });
  
  console.log(`🔔 Notification emitted to user: ${userId}`);
};

/**
 * Get user-friendly order status message
 * @param {String} status - Order status
 * @returns {String} - User-friendly message
 */
const getOrderStatusMessage = (status) => {
  const messages = {
    quotation: 'Quote generated - Review and confirm your order',
    reserved: 'Order confirmed - Prepare for pickup',
    picked_up: 'Items picked up - Enjoy your rental!',
    returned: 'Items returned - Thank you for your business',
    late: 'Return overdue - Please return items ASAP',
    cancelled: 'Order cancelled - Refund will be processed'
  };
  
  return messages[status] || 'Order status updated';
};

module.exports = {
  initializeSocket,
  emitProductUpdate,
  emitOrderUpdate,
  emitStockAlert,
  emitLateFeeUpdate,
  emitNotification
};
