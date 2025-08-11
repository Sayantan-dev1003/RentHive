const express = require('express');
const {
  createPricelist,
  getPricelists,
  getPricelistById,
  updatePricelist,
  deletePricelist,
  getActivePricelists,
  getCustomerPricelists,
  previewPricelistDiscount,
  togglePricelistStatus
} = require('../controllers/pricelist.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/pricelists:
 *   get:
 *     summary: Get all pricelists
 *     tags: [Pricelists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pricelists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pricelists:
 *                       type: array
 *   post:
 *     summary: Create a new pricelist
 *     tags: [Pricelists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - rules
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Summer Discount"
 *               type:
 *                 type: string
 *                 enum: [default, seasonal, corporate, vip]
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Pricelist created successfully
 */

/**
 * @swagger
 * /api/pricelists/active:
 *   get:
 *     summary: Get active pricelists
 *     tags: [Pricelists]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check for active pricelists
 *     responses:
 *       200:
 *         description: List of active pricelists
 */

// Public routes
router.get('/active', getActivePricelists);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

// Customer and admin routes
router.get('/customer/:customerId', getCustomerPricelists);
router.post('/:id/preview', previewPricelistDiscount);

// Admin only routes
router.post('/', authorizeRoles('end_user'), createPricelist);
router.get('/', authorizeRoles('end_user'), getPricelists);
router.get('/:id', authorizeRoles('end_user'), getPricelistById);
router.put('/:id', authorizeRoles('end_user'), updatePricelist);
router.delete('/:id', authorizeRoles('end_user'), deletePricelist);
router.patch('/:id/toggle', authorizeRoles('end_user'), togglePricelistStatus);

module.exports = router;
