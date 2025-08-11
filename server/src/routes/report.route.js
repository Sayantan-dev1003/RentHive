const express = require('express');
const {
  getMostRentedProducts,
  getTotalRevenue,
  getTopCustomers,
  getOrderStatusReport,
  getInventoryUtilization,
  getFinancialSummary,
  exportReport
} = require('../controllers/report.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes (admin only)
router.use(auth, authorizeRoles('end_user'));

// Report routes
router.get('/most-rented-products', getMostRentedProducts);
router.get('/total-revenue', getTotalRevenue);
router.get('/top-customers', getTopCustomers);
router.get('/order-status', getOrderStatusReport);
router.get('/inventory-utilization', getInventoryUtilization);
router.get('/financial-summary', getFinancialSummary);
router.get('/export', exportReport);

module.exports = router;
