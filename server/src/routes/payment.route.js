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
