const express = require('express');
const {
  createQuote,
  confirmOrder,
  getOrders,
  getOrderById,
  markPickup,
  markReturn,
  cancelOrder,
  generateInvoice,
  getOrderStats
} = require('../controllers/order.controller');
const { auth, authorizeRoles, ownerOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// Quote and order creation (customers and admins)
router.post('/quote', createQuote);
router.post('/', confirmOrder);

// Order listing and details
router.get('/', getOrders);
router.get('/stats', authorizeRoles('end_user'), getOrderStats);
router.get('/:id', getOrderById);

// Order management (admin only)
router.patch('/:id/pickup', authorizeRoles('end_user'), markPickup);
router.patch('/:id/return', authorizeRoles('end_user'), markReturn);
router.patch('/:id/cancel', cancelOrder); // Both customers and admins can cancel

// Invoice generation
router.get('/:id/invoice', generateInvoice);

module.exports = router;
