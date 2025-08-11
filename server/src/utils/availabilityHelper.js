const moment = require('moment');
const Product = require('../models/Product');

/**
 * Check if a product is available for the given date range and quantity
 * @param {Object} product - Product document
 * @param {Date} startDate - Rental start date
 * @param {Date} endDate - Rental end date
 * @param {Number} quantity - Required quantity
 * @returns {Boolean} Whether the product is available
 */
const isAvailable = (product, startDate, endDate, quantity = 1) => {
  // Basic validation
  if (!product || !startDate || !endDate || quantity <= 0) {
    return false;
  }

  // Check if product is rentable
  if (!product.rentable || !product.isActive) {
    return false;
  }

  // Check if dates are valid
  const start = moment(startDate);
  const end = moment(endDate);
  
  if (!start.isValid() || !end.isValid() || end.isSameOrBefore(start)) {
    return false;
  }

  // Check if the requested period overlaps with existing reservations
  const overlappingReservations = product.availability.filter(reservation => {
    const reservationStart = moment(reservation.startDate);
    const reservationEnd = moment(reservation.endDate);
    
    // Two periods overlap if: startA <= endB && startB <= endA
    return start.isSameOrBefore(reservationEnd) && reservationStart.isSameOrBefore(end);
  });

  // Calculate total reserved quantity during the overlap period
  const reservedQuantity = overlappingReservations.reduce(
    (total, reservation) => total + reservation.quantity, 
    0
  );

  // Check if we have enough stock available
  const availableQuantity = product.stock - reservedQuantity;
  return availableQuantity >= quantity;
};

/**
 * Reserve a product for a specific period and order
 * @param {String} productId - Product ID
 * @param {Date} startDate - Rental start date
 * @param {Date} endDate - Rental end date
 * @param {String} orderId - Order ID
 * @param {Number} quantity - Quantity to reserve
 * @returns {Promise<Object>} Updated product document
 */
const reserveProduct = async (productId, startDate, endDate, orderId, quantity = 1) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate availability before reserving
    if (!isAvailable(product, startDate, endDate, quantity)) {
      throw new Error('Product is not available for the requested period and quantity');
    }

    // Add reservation to product availability
    const reservation = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      orderId,
      quantity
    };

    product.availability.push(reservation);
    
    // Save the updated product
    const updatedProduct = await product.save();
    
    return {
      success: true,
      product: updatedProduct,
      reservation
    };
  } catch (error) {
    throw new Error(`Failed to reserve product: ${error.message}`);
  }
};

/**
 * Release a product reservation (when order is cancelled or returned)
 * @param {String} productId - Product ID
 * @param {String} orderId - Order ID
 * @returns {Promise<Object>} Updated product document
 */
const releaseReservation = async (productId, orderId) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Remove reservations for this order
    const initialCount = product.availability.length;
    product.availability = product.availability.filter(
      reservation => reservation.orderId.toString() !== orderId.toString()
    );

    const removedCount = initialCount - product.availability.length;
    
    if (removedCount === 0) {
      throw new Error('No reservations found for this order');
    }

    const updatedProduct = await product.save();
    
    return {
      success: true,
      product: updatedProduct,
      removedReservations: removedCount
    };
  } catch (error) {
    throw new Error(`Failed to release reservation: ${error.message}`);
  }
};

/**
 * Get available quantity for a product during a specific period
 * @param {Object} product - Product document
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number} Available quantity
 */
const getAvailableQuantity = (product, startDate, endDate) => {
  if (!product || !startDate || !endDate) {
    return 0;
  }

  const start = moment(startDate);
  const end = moment(endDate);

  // Find overlapping reservations
  const overlappingReservations = product.availability.filter(reservation => {
    const reservationStart = moment(reservation.startDate);
    const reservationEnd = moment(reservation.endDate);
    
    return start.isSameOrBefore(reservationEnd) && reservationStart.isSameOrBefore(end);
  });

  // Calculate reserved quantity
  const reservedQuantity = overlappingReservations.reduce(
    (total, reservation) => total + reservation.quantity, 
    0
  );

  return Math.max(0, product.stock - reservedQuantity);
};

/**
 * Check availability for multiple products
 * @param {Array} items - Array of {productId, quantity, startDate, endDate}
 * @returns {Promise<Object>} Availability status for each product
 */
const checkMultipleAvailability = async (items) => {
  const results = {};
  
  for (const item of items) {
    try {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        results[item.productId] = {
          available: false,
          reason: 'Product not found',
          availableQuantity: 0
        };
        continue;
      }

      const available = isAvailable(
        product, 
        item.startDate, 
        item.endDate, 
        item.quantity
      );

      const availableQuantity = getAvailableQuantity(
        product, 
        item.startDate, 
        item.endDate
      );

      results[item.productId] = {
        available,
        reason: available ? null : 'Insufficient quantity available',
        availableQuantity,
        requestedQuantity: item.quantity,
        productName: product.name
      };
    } catch (error) {
      results[item.productId] = {
        available: false,
        reason: error.message,
        availableQuantity: 0
      };
    }
  }
  
  return results;
};

/**
 * Get product availability calendar for a date range
 * @param {String} productId - Product ID
 * @param {Date} startDate - Calendar start date
 * @param {Date} endDate - Calendar end date
 * @returns {Promise<Array>} Array of availability data by date
 */
const getAvailabilityCalendar = async (productId, startDate, endDate) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const calendar = [];
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');
    
    // Iterate through each day
    let currentDate = start.clone();
    while (currentDate.isSameOrBefore(end)) {
      const dayStart = currentDate.clone().startOf('day');
      const dayEnd = currentDate.clone().endOf('day');
      
      const availableQuantity = getAvailableQuantity(
        product, 
        dayStart.toDate(), 
        dayEnd.toDate()
      );

      calendar.push({
        date: currentDate.format('YYYY-MM-DD'),
        availableQuantity,
        totalStock: product.stock,
        isFullyBooked: availableQuantity === 0
      });
      
      currentDate.add(1, 'day');
    }
    
    return calendar;
  } catch (error) {
    throw new Error(`Failed to get availability calendar: ${error.message}`);
  }
};

/**
 * Find next available slot for a product
 * @param {String} productId - Product ID
 * @param {Number} durationHours - Required duration in hours
 * @param {Number} quantity - Required quantity
 * @param {Date} fromDate - Search from this date (default: now)
 * @returns {Promise<Object>} Next available slot or null
 */
const findNextAvailableSlot = async (productId, durationHours, quantity = 1, fromDate = new Date()) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const searchStart = moment(fromDate).startOf('hour');
    const maxSearchDays = 30; // Limit search to 30 days
    
    // Check each hour for availability
    for (let i = 0; i < maxSearchDays * 24; i++) {
      const slotStart = searchStart.clone().add(i, 'hours');
      const slotEnd = slotStart.clone().add(durationHours, 'hours');
      
      if (isAvailable(product, slotStart.toDate(), slotEnd.toDate(), quantity)) {
        return {
          startDate: slotStart.toDate(),
          endDate: slotEnd.toDate(),
          availableQuantity: getAvailableQuantity(
            product, 
            slotStart.toDate(), 
            slotEnd.toDate()
          )
        };
      }
    }
    
    return null; // No available slot found
  } catch (error) {
    throw new Error(`Failed to find next available slot: ${error.message}`);
  }
};

module.exports = {
  isAvailable,
  reserveProduct,
  releaseReservation,
  getAvailableQuantity,
  checkMultipleAvailability,
  getAvailabilityCalendar,
  findNextAvailableSlot
};
