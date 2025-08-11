const express = require('express');
const {
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
} = require('../controllers/order.controller');
const { auth, authorizeRoles, adminOnly, customerOnly, checkResourceOwnership } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders/quote:
 *   post:
 *     summary: Generate a quote for rental items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *                 example: "507f1f77bcf86cd799439011"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - startDate
 *                     - endDate
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:00:00Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-17T18:00:00Z"
 *               pricelistId:
 *                 type: string
 *                 description: Optional pricelist to apply
 *     responses:
 *       200:
 *         description: Quote generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         quote:
 *                           type: object
 *                           properties:
 *                             quoteId:
 *                               type: string
 *                             totalAmount:
 *                               type: number
 *                             validUntil:
 *                               type: string
 *                               format: date-time
 *       400:
 *         description: Items not available or validation error

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Confirm and create an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *               depositAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 500
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         order:
 *                           $ref: '#/components/schemas/Order'
 *   get:
 *     summary: Get orders with filtering
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [quotation, reserved, picked_up, returned, late, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, partial, paid, refunded]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         orders:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Order'

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         order:
 *                           $ref: '#/components/schemas/Order'

/**
 * @swagger
 * /api/orders/{id}/pickup:
 *   patch:
 *     summary: Mark order as picked up (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order marked as picked up

/**
 * @swagger
 * /api/orders/{id}/return:
 *   patch:
 *     summary: Mark order as returned (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               condition:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order marked as returned

/**
 * @swagger
 * /api/orders/{id}/invoice:
 *   get:
 *     summary: Generate and get invoice for order
 *     tags: [Orders]
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
 *         description: Invoice generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         invoiceId:
 *                           type: string
 *                         pdfPath:
 *                           type: string
 *                         downloadUrl:
 *                           type: string
 */

// Protected routes (require authentication)
router.use(auth);

// Quote and order creation (customers and admins)
router.post('/quote', createQuote);
router.post('/', confirmOrder);

// Order listing and details
router.get('/', getOrders);
router.get('/stats', adminOnly, getOrderStats);
router.get('/test-invoice', testInvoiceSystem); // Test route for invoice system
router.get('/:id', getOrderById);

// Order management (admin only)
router.patch('/:id/pickup', adminOnly, markPickup);
router.patch('/:id/return', adminOnly, markReturn);

// Order cancellation - customers can cancel their own, admins can cancel any
router.delete('/:id', cancelOrder);

// Order extension - customers can extend their own orders
router.post('/:id/extend', extendOrder);

// Invoice generation and download
router.get('/:id/invoice', generateInvoice);
router.get('/:id/invoice/download', downloadInvoicePDF);

module.exports = router;
