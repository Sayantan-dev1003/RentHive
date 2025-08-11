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

/**
 * @swagger
 * /api/reports/most-rented-products:
 *   get:
 *     summary: Get most rented products report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Most rented products data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                       rentalCount:
 *                         type: number
 */

/**
 * @swagger
 * /api/reports/total-revenue:
 *   get:
 *     summary: Get total revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Revenue statistics
 */

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export reports as PDF or CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [most-rented-products, total-revenue, top-customers, inventory]
 *         description: Report type to export
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, csv]
 *         description: Export format
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 */

// Protected routes (admin only)
router.use(auth, adminOnly);

// Report routes
router.get('/most-rented-products', getMostRentedProducts);
router.get('/total-revenue', getTotalRevenue);
router.get('/top-customers', getTopCustomers);
router.get('/inventory', getInventoryReport);
router.get('/export', exportReport);

module.exports = router;
