const PickupSlot = require('../models/PickupSlot');
const Order = require('../models/Order');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middlewares/errorHandler');
const { emitOrderUpdate } = require('../utils/socket');

/**
 * Create pickup slots for a date range
 * POST /api/pickup-slots/bulk
 */
const createPickupSlots = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    timeSlots = [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '13:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' }
    ],
    location,
    maxCapacity = 5,
    notes
  } = req.body;

  // Validate required fields
  if (!startDate || !endDate || !location?.name || !location?.address) {
    throw createValidationError('Start date, end date, and location details are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw createValidationError('End date must be after start date');
  }

  if (start < new Date()) {
    throw createValidationError('Cannot create slots for past dates');
  }

  const slots = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    // Skip Sundays (day 0)
    if (currentDate.getDay() !== 0) {
      for (const timeSlot of timeSlots) {
        const slot = new PickupSlot({
          date: new Date(currentDate),
          timeSlot,
          maxCapacity,
          location,
          notes,
          createdBy: req.user._id
        });
        slots.push(slot);
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const createdSlots = await PickupSlot.insertMany(slots);

  res.status(201).json({
    success: true,
    message: `Created ${createdSlots.length} pickup slots`,
    data: {
      slots: createdSlots,
      summary: {
        totalSlots: createdSlots.length,
        dateRange: { startDate, endDate },
        timeSlotsPerDay: timeSlots.length,
        location: location.name
      }
    }
  });
});

/**
 * Get available pickup slots for a date range
 * GET /api/pickup-slots/available
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate = startDate, 
    location,
    minCapacity = 1 
  } = req.query;

  if (!startDate) {
    throw createValidationError('Start date is required');
  }

  let query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isActive: true,
    $expr: {
      $gte: [
        { $subtract: ['$maxCapacity', '$currentBookings'] },
        parseInt(minCapacity)
      ]
    }
  };

  if (location) {
    query['location.name'] = { $regex: location, $options: 'i' };
  }

  const slots = await PickupSlot.find(query)
    .sort({ date: 1, 'timeSlot.startTime': 1 })
    .populate('createdBy', 'name email');

  // Group slots by date for easier frontend consumption
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = slot.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      slots,
      groupedByDate: groupedSlots,
      summary: {
        totalAvailableSlots: slots.length,
        dateRange: { startDate, endDate },
        totalCapacity: slots.reduce((sum, slot) => sum + slot.remainingCapacity, 0)
      }
    }
  });
});

/**
 * Book a pickup slot for an order
 * POST /api/pickup-slots/:slotId/book
 */
const bookPickupSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { orderId } = req.body;

  if (!orderId) {
    throw createValidationError('Order ID is required');
  }

  // Find the slot
  const slot = await PickupSlot.findById(slotId);
  if (!slot) {
    throw createNotFoundError('Pickup slot');
  }

  // Find and validate the order
  const order = await Order.findById(orderId).populate('customerId', 'name email phone');
  if (!order) {
    throw createNotFoundError('Order');
  }

  // Check if user can book for this order
  if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
    throw createValidationError('You can only book pickup slots for your own orders');
  }

  // Check if order can have pickup scheduled
  if (order.status === 'cancelled') {
    throw createValidationError('Cannot schedule pickup for cancelled order');
  }

  if (order.paymentStatus === 'pending') {
    throw createValidationError('Order must be paid before scheduling pickup');
  }

  if (order.pickupSlot?.slotId) {
    throw createValidationError('Order already has a pickup slot booked');
  }

  // Check slot availability
  if (!slot.canAccommodate(1)) {
    throw createValidationError('Pickup slot is fully booked');
  }

  // Book the slot
  await slot.bookSlot(1);

  // Update the order
  order.pickupSlot = {
    slotId: slot._id,
    confirmedAt: new Date(),
    status: 'confirmed'
  };
  order.pickupDate = slot.date;

  await order.save();

  // Emit real-time update
  emitOrderUpdate(order._id, {
    status: order.status,
    pickupSlot: order.pickupSlot,
    message: 'Pickup slot booked successfully'
  });

  await order.populate('pickupSlot.slotId');

  res.status(200).json({
    success: true,
    message: 'Pickup slot booked successfully',
    data: {
      order,
      pickupSlot: slot,
      notification: {
        title: 'Pickup Scheduled',
        message: `Your pickup is scheduled for ${slot.formattedDate} at ${slot.formattedTimeRange}`,
        customerInfo: {
          name: order.customerId.name,
          email: order.customerId.email,
          phone: order.customerId.phone
        }
      }
    }
  });
});

/**
 * Cancel pickup slot booking
 * DELETE /api/pickup-slots/:slotId/booking/:orderId
 */
const cancelPickupSlot = asyncHandler(async (req, res) => {
  const { slotId, orderId } = req.params;

  // Find the slot and order
  const [slot, order] = await Promise.all([
    PickupSlot.findById(slotId),
    Order.findById(orderId)
  ]);

  if (!slot) {
    throw createNotFoundError('Pickup slot');
  }

  if (!order) {
    throw createNotFoundError('Order');
  }

  // Check permissions
  if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
    throw createValidationError('You can only cancel pickup slots for your own orders');
  }

  // Check if order has this slot booked
  if (!order.pickupSlot?.slotId || order.pickupSlot.slotId.toString() !== slotId) {
    throw createValidationError('Order does not have this pickup slot booked');
  }

  // Check if pickup can be cancelled
  if (order.pickupSlot.status === 'completed') {
    throw createValidationError('Cannot cancel completed pickup');
  }

  // Release the slot
  await slot.releaseSlot(1);

  // Update the order
  order.pickupSlot = {
    slotId: null,
    confirmedAt: null,
    status: 'pending'
  };
  order.pickupDate = null;

  await order.save();

  // Emit real-time update
  emitOrderUpdate(order._id, {
    status: order.status,
    pickupSlot: order.pickupSlot,
    message: 'Pickup slot cancelled'
  });

  res.status(200).json({
    success: true,
    message: 'Pickup slot booking cancelled successfully',
    data: {
      order,
      releasedSlot: slot
    }
  });
});

/**
 * Get pickup slots for a specific date
 * GET /api/pickup-slots/date/:date
 */
const getSlotsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  if (!date) {
    throw createValidationError('Date is required');
  }

  const slots = await PickupSlot.getSlotsForDate(date);

  res.status(200).json({
    success: true,
    data: {
      date,
      slots,
      summary: {
        totalSlots: slots.length,
        availableSlots: slots.filter(slot => slot.isAvailable).length,
        totalCapacity: slots.reduce((sum, slot) => sum + slot.maxCapacity, 0),
        availableCapacity: slots.reduce((sum, slot) => sum + slot.remainingCapacity, 0)
      }
    }
  });
});

/**
 * Get all pickup slots with filtering and pagination
 * GET /api/pickup-slots
 */
const getPickupSlots = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    location,
    isActive,
    sortBy = 'date',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  let query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (location) {
    query['location.name'] = { $regex: location, $options: 'i' };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Build sort object
  const sort = {};
  if (sortBy === 'date') {
    sort.date = sortOrder === 'desc' ? -1 : 1;
    sort['timeSlot.startTime'] = 1;
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Execute query with pagination
  const slots = await PickupSlot.find(query)
    .populate('createdBy', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await PickupSlot.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      slots,
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
 * Update pickup slot
 * PUT /api/pickup-slots/:id
 */
const updatePickupSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const slot = await PickupSlot.findById(id);
  if (!slot) {
    throw createNotFoundError('Pickup slot');
  }

  // Prevent updating if slot has bookings and trying to reduce capacity
  if (updates.maxCapacity && updates.maxCapacity < slot.currentBookings) {
    throw createValidationError('Cannot reduce capacity below current bookings');
  }

  // Apply updates
  Object.keys(updates).forEach(key => {
    if (key !== '_id' && key !== 'createdBy' && key !== 'currentBookings') {
      slot[key] = updates[key];
    }
  });

  await slot.save();

  res.status(200).json({
    success: true,
    message: 'Pickup slot updated successfully',
    data: {
      slot
    }
  });
});

/**
 * Delete pickup slot
 * DELETE /api/pickup-slots/:id
 */
const deletePickupSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const slot = await PickupSlot.findById(id);
  if (!slot) {
    throw createNotFoundError('Pickup slot');
  }

  // Check if slot has bookings
  if (slot.currentBookings > 0) {
    throw createValidationError('Cannot delete pickup slot with existing bookings');
  }

  await PickupSlot.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Pickup slot deleted successfully'
  });
});

/**
 * Mark pickup as completed
 * POST /api/pickup-slots/:slotId/complete/:orderId
 */
const markPickupCompleted = asyncHandler(async (req, res) => {
  const { slotId, orderId } = req.params;
  const { notes } = req.body;

  // Find the order
  const order = await Order.findById(orderId).populate('customerId', 'name email');
  if (!order) {
    throw createNotFoundError('Order');
  }

  // Validate pickup slot
  if (!order.pickupSlot?.slotId || order.pickupSlot.slotId.toString() !== slotId) {
    throw createValidationError('Order does not have this pickup slot booked');
  }

  if (order.pickupSlot.status === 'completed') {
    throw createValidationError('Pickup already marked as completed');
  }

  // Update order status
  order.pickupSlot.status = 'completed';
  order.status = 'picked_up';
  order.pickupDate = new Date();
  
  if (notes) {
    order.notes = (order.notes || '') + `\nPickup completed: ${notes}`;
  }

  await order.save();

  // Emit real-time update
  emitOrderUpdate(order._id, {
    status: order.status,
    pickupSlot: order.pickupSlot,
    message: 'Pickup completed successfully'
  });

  res.status(200).json({
    success: true,
    message: 'Pickup marked as completed',
    data: {
      order,
      notification: {
        title: 'Pickup Completed',
        message: `Order ${order._id} has been picked up successfully`,
        customerInfo: {
          name: order.customerId.name,
          email: order.customerId.email
        }
      }
    }
  });
});

module.exports = {
  createPickupSlots,
  getAvailableSlots,
  bookPickupSlot,
  cancelPickupSlot,
  getSlotsByDate,
  getPickupSlots,
  updatePickupSlot,
  deletePickupSlot,
  markPickupCompleted
};
