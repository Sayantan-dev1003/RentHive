const express = require('express');
const {
  getMostRentedProducts,
  getTotalRevenue,
  getTopCustomers,
  getInventoryReport,
  exportReport
} = require('../controllers/report.controller');
const { auth, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes (admin only)
router.use(auth, adminOnly);

// Report routes
router.get('/most-rented-products', getMostRentedProducts);
router.get('/total-revenue', getTotalRevenue);
router.get('/top-customers', getTopCustomers);
router.get('/inventory', getInventoryReport);
router.get('/export', exportReport);

module.exports = router;
