const express = require('express');
const {
  processOrderPayment,
  getPaymentById,
  getOrderPayments,
  getPayments,
  refundPayment,
  getPaymentStatistics,
  retryPayment,
  getPaymentMethods
} = require('../controllers/payment.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID to pay for
 *                 example: "507f1f77bcf86cd799439011"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Payment amount
 *                 example: 500
 *               method:
 *                 type: string
 *                 enum: [mock, razorpay, stripe, paypal, cash, bank_transfer]
 *                 default: mock
 *                 description: Payment method
 *                 example: "mock"
 *               forceFail:
 *                 type: boolean
 *                 default: false
 *                 description: Force payment failure (for testing)
 *     responses:
 *       200:
 *         description: Payment processed successfully
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
 *                         payment:
 *                           $ref: '#/components/schemas/Payment'
 *                         transactionId:
 *                           type: string
 *                         gatewayResponse:
 *                           type: object
 *       400:
 *         description: Payment failed or validation error

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payments with filtering
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Payments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [mock, razorpay, stripe, paypal, cash, bank_transfer]
 *         description: Filter by payment method
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                         payments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Payment'

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
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
 *                         payment:
 *                           $ref: '#/components/schemas/Payment'

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Process refund for a payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Refund amount (defaults to full amount)
 *               reason:
 *                 type: string
 *                 description: Refund reason
 *                 example: "Customer cancellation"
 *     responses:
 *       200:
 *         description: Refund processed successfully
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
 *                         refund:
 *                           type: object
 *                         payment:
 *                           $ref: '#/components/schemas/Payment'

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Get all payments for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order payments retrieved successfully
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
 *                         payments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Payment'
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalPaid:
 *                               type: number
 *                             remainingAmount:
 *                               type: number
 *                             orderTotal:
 *                               type: number
 */

// Protected routes (require authentication)
router.use(auth);

// Payment processing
router.post('/process', processOrderPayment);
router.post('/:id/retry', retryPayment);

// Payment information
router.get('/', getPayments);
router.get('/methods', getPaymentMethods);
router.get('/stats', authorizeRoles('end_user'), getPaymentStatistics);
router.get('/order/:orderId', getOrderPayments);
router.get('/:id', getPaymentById);

// Payment management (admin only)
router.post('/:id/refund', authorizeRoles('end_user'), refundPayment);

module.exports = router;
