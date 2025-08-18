const express = require('express');
const {
  createPickupSlots,
  getAvailableSlots,
  bookPickupSlot,
  cancelPickupSlot,
  getSlotsByDate,
  getPickupSlots,
  updatePickupSlot,
  deletePickupSlot,
  markPickupCompleted
} = require('../controllers/pickupSlot.controller');
const { auth, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     PickupSlot:
 *       type: object
 *       required:
 *         - date
 *         - timeSlot
 *         - location
 *         - maxCapacity
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the pickup slot
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the pickup slot
 *         timeSlot:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               example: '09:00'
 *             endTime:
 *               type: string
 *               pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               example: '11:00'
 *         maxCapacity:
 *           type: number
 *           minimum: 1
 *           description: Maximum number of pickups for this slot
 *         currentBookings:
 *           type: number
 *           minimum: 0
 *           description: Current number of bookings
 *         location:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *         isActive:
 *           type: boolean
 *           default: true
 *         notes:
 *           type: string
 *           maxLength: 500
 */

/**
 * @swagger
 * /api/pickup-slots/bulk:
 *   post:
 *     summary: Create pickup slots for a date range
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - location
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *               maxCapacity:
 *                 type: number
 *                 default: 5
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pickup slots created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk', adminOnly, createPickupSlots);

/**
 * @swagger
 * /api/pickup-slots/available:
 *   get:
 *     summary: Get available pickup slots for a date range
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Available pickup slots retrieved successfully
 *       400:
 *         description: Invalid request parameters
 */
router.get('/available', getAvailableSlots);

/**
 * @swagger
 * /api/pickup-slots/date/{date}:
 *   get:
 *     summary: Get pickup slots for a specific date
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Pickup slots for the date retrieved successfully
 *       400:
 *         description: Invalid date format
 */
router.get('/date/:date', getSlotsByDate);

/**
 * @swagger
 * /api/pickup-slots/{slotId}/book:
 *   post:
 *     summary: Book a pickup slot for an order
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pickup slot booked successfully
 *       400:
 *         description: Invalid request or slot unavailable
 *       404:
 *         description: Pickup slot or order not found
 */
router.post('/:slotId/book', bookPickupSlot);

/**
 * @swagger
 * /api/pickup-slots/{slotId}/booking/{orderId}:
 *   delete:
 *     summary: Cancel pickup slot booking
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pickup slot booking cancelled successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Pickup slot or order not found
 */
router.delete('/:slotId/booking/:orderId', cancelPickupSlot);

/**
 * @swagger
 * /api/pickup-slots/{slotId}/complete/{orderId}:
 *   post:
 *     summary: Mark pickup as completed
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pickup marked as completed
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Order not found
 */
router.post('/:slotId/complete/:orderId', adminOnly, markPickupCompleted);

/**
 * @swagger
 * /api/pickup-slots:
 *   get:
 *     summary: Get all pickup slots with filtering and pagination
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Pickup slots retrieved successfully
 */
router.get('/', getPickupSlots);

/**
 * @swagger
 * /api/pickup-slots/{id}:
 *   put:
 *     summary: Update pickup slot
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PickupSlot'
 *     responses:
 *       200:
 *         description: Pickup slot updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Pickup slot not found
 */
router.put('/:id', adminOnly, updatePickupSlot);

/**
 * @swagger
 * /api/pickup-slots/{id}:
 *   delete:
 *     summary: Delete pickup slot
 *     tags: [Pickup Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pickup slot deleted successfully
 *       400:
 *         description: Cannot delete slot with existing bookings
 *       404:
 *         description: Pickup slot not found
 */
router.delete('/:id', adminOnly, deletePickupSlot);

module.exports = router;
